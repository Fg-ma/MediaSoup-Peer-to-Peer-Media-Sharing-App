package com.example.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.connect.connector.ConnectRecord;
import org.apache.kafka.connect.data.Schema;
import org.apache.kafka.connect.transforms.Transformation;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.connect.errors.DataException;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * A Kafka Connect SMT that:
 * 1) Flattens a MongoDB Debezium envelope by extracting fullDocument for inserts/updates
 * 2) Emits a tombstone (null value) for deletes, using a business key or Mongo _id
 */
public class QdrantMultitool<R extends ConnectRecord<R>> implements Transformation<R> {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final String ID_FIELD_MAP_CONFIG = "id.field.map";

    // topic -> business field name used as Qdrant ID
    private final Map<String, String> idFieldMap = new HashMap<>();

    @Override
    public ConfigDef config() {
        return new ConfigDef()
            .define(ID_FIELD_MAP_CONFIG,
                    ConfigDef.Type.LIST,
                    Collections.emptyList(),
                    ConfigDef.Importance.HIGH,
                    "Comma-separated list of topic:field mappings for business ID key");
    }

    @Override
    public void configure(Map<String, ?> configs) {
        Object raw = configs.get(ID_FIELD_MAP_CONFIG);
        List<String> entries = new ArrayList<>();
        if (raw instanceof List) {
            for (Object o : (List<?>) raw) entries.add(o.toString().trim());
        } else if (raw instanceof String) {
            Collections.addAll(entries, ((String) raw).split("\\s*,\\s*"));
        }
        for (String entry : entries) {
            String[] parts = entry.split(":", 2);
            if (parts.length == 2) {
                idFieldMap.put(parts[0], parts[1]);
            }
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public R apply(R record) {
        Object value = record.value();
        if (value == null) {
            return record;
        }

        Map<String, Object> jsonMap;
        try {
            if (value instanceof Map) {
                jsonMap = (Map<String, Object>) value;
            } else if (value instanceof String) {
                jsonMap = MAPPER.readValue((String) value, Map.class);
            } else {
                return record;
            }
        } catch (Exception e) {
            throw new DataException("Failed to parse record value into JSON map", e);
        }

        String op = (String) jsonMap.get("operationType");
        String topic = record.topic();

        if ("delete".equals(op)) {
            String id = resolveDeleteId(jsonMap, topic);
            return record.newRecord(
                topic,
                record.kafkaPartition(),
                record.keySchema(),
                id,
                (Schema) null,
                null,
                record.timestamp()
            );
        }

        Map<String, Object> fullDoc = (Map<String, Object>) jsonMap.get("fullDocument");
        if (fullDoc == null) {
            throw new DataException("Insert/update event missing fullDocument");
        }

        Map<String, Object> cleaned = cleanExtendedJson(fullDoc);
        String id = resolveUpsertId(cleaned, topic);

        return record.newRecord(
            topic,
            record.kafkaPartition(),
            record.keySchema(),
            id,
            null,
            cleaned,
            record.timestamp()
        );
    }

    @SuppressWarnings("unchecked")
    private String resolveDeleteId(Map<String, Object> jsonMap, String topic) {
        String idField = idFieldMap.get(topic);
        if (idField != null) {
            Map<String, Object> before = (Map<String, Object>) jsonMap.get("fullDocumentBeforeChange");
            if (before != null && before.containsKey(idField)) {
                return before.get(idField).toString();
            } else {
                throw new DataException("Pre-image missing field '" + idField + "' for topic " + topic);
            }
        }
        Map<String, Object> documentKey = (Map<String, Object>) jsonMap.get("documentKey");
        return extractOid(documentKey);
    }

    private String resolveUpsertId(Map<String, Object> cleaned, String topic) {
        String idField = idFieldMap.get(topic);
        if (idField != null && cleaned.containsKey(idField)) {
            return cleaned.get(idField).toString();
        }
        if (cleaned.containsKey("_id")) {
            return cleaned.get("_id").toString();
        }
        throw new DataException("Record missing configured id-field and _id for topic " + topic);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> cleanExtendedJson(Map<String, Object> input) {
        Map<String, Object> output = new HashMap<>();
        for (Map.Entry<String, Object> e : input.entrySet()) {
            String key = e.getKey();
            Object value = e.getValue();
            if (value instanceof Map) {
                Map<String, Object> sub = (Map<String, Object>) value;
                output.put(key, simplifyExtendedField(sub));
            } else if (value instanceof Iterable) {
                List<Object> list = new ArrayList<>();
                for (Object item : (Iterable<?>) value) {
                    if (item instanceof Map) {
                        list.add(cleanExtendedJson((Map<String, Object>) item));
                    } else {
                        list.add(item);
                    }
                }
                output.put(key, list);
            } else {
                output.put(key, value);
            }
        }
        return output;
    }

    @SuppressWarnings("unchecked")
    private Object simplifyExtendedField(Map<String, Object> sub) {
        if (sub.size() == 1) {
            if (sub.containsKey("$oid")) {
                return sub.get("$oid");
            } else if (sub.containsKey("$date")) {
                return sub.get("$date");
            } else if (sub.containsKey("$timestamp")) {
                Map<String, Object> ts = (Map<String, Object>) sub.get("$timestamp");
                return ((Number) ts.get("t")).longValue() * 1000;
            }
        }
        return cleanExtendedJson(sub);
    }

    private String extractOid(Map<String, Object> documentKey) {
        if (documentKey == null || !documentKey.containsKey("_id")) {
            throw new DataException("Delete event missing documentKey._id");
        }
        Object idObj = documentKey.get("_id");
        if (idObj instanceof Map && ((Map<?, ?>) idObj).containsKey("$oid")) {
            return ((Map<?, ?>) idObj).get("$oid").toString();
        }
        return idObj.toString();
    }

    @Override
    public void close() {
        // no resources to clean up
    }
}
