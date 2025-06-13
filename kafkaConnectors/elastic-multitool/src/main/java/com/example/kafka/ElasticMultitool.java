package com.example.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.connect.connector.ConnectRecord;
import org.apache.kafka.connect.transforms.Transformation;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.connect.errors.DataException;

import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;

public class ElasticMultitool<R extends ConnectRecord<R>> implements Transformation<R> {
    private static final ObjectMapper mapper = new ObjectMapper();

    private static final String WHITELIST_CONFIG  = "json.whitelist";
    private static final String ID_MAPPING_CONFIG = "json.id.mapping";

    private final Map<String, Set<String>> topicWhitelist = new HashMap<>();
    private final Map<String, String>        topicIdField    = new HashMap<>();

    @Override
    public ConfigDef config() {
        return new ConfigDef()
            .define(WHITELIST_CONFIG,
                    ConfigDef.Type.LIST,
                    new ArrayList<>(),
                    ConfigDef.Importance.HIGH,
                    "Comma-separated list of topic:field1|field2 mappings, e.g. tbl1:n|x,tbl2:other")
            .define(ID_MAPPING_CONFIG,
                    ConfigDef.Type.LIST,
                    new ArrayList<>(),
                    ConfigDef.Importance.HIGH,
                    "Comma-separated list of topic:uuidField mappings, e.g. orders:sid,users:aid");
    }

    @Override
    @SuppressWarnings("unchecked")
    public void configure(Map<String, ?> configs) {
        Object rawWhitelist = configs.get(WHITELIST_CONFIG);
        List<String> whitelistEntries = new ArrayList<>();
        if (rawWhitelist instanceof String) {
            for (String entry : ((String) rawWhitelist).split(",")) {
                whitelistEntries.add(entry.trim());
            }
        } else if (rawWhitelist instanceof List) {
            for (Object o : (List<?>) rawWhitelist) {
                whitelistEntries.add(o.toString().trim());
            }
        }
        for (String entry : whitelistEntries) {
            String[] parts = entry.split(":", 2);
            if (parts.length < 2) continue;
            String topic = parts[0];
            Set<String> fields = new HashSet<>();
            for (String field : parts[1].split("\\|")) {
                fields.add(field.trim());
            }
            topicWhitelist.put(topic, fields);
        }

        Object rawIdMap = configs.get(ID_MAPPING_CONFIG);
        List<String> idMapEntries = new ArrayList<>();
        if (rawIdMap instanceof String) {
            for (String entry : ((String) rawIdMap).split(",")) {
                idMapEntries.add(entry.trim());
            }
        } else if (rawIdMap instanceof List) {
            for (Object o : (List<?>) rawIdMap) {
                idMapEntries.add(o.toString().trim());
            }
        }
        for (String entry : idMapEntries) {
            String[] parts = entry.split(":", 2);
            if (parts.length == 2) {
                topicIdField.put(parts[0], parts[1].trim());
            }
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public R apply(R record) {
        Object value = record.value();
        Map<String, Object> jsonMap;
        try {
            if (value instanceof Map) {
                jsonMap = (Map<String, Object>) value;
            } else if (value instanceof String) {
                jsonMap = mapper.readValue((String) value, Map.class);
            } else {
                return record;
            }
        } catch (Exception e) {
            throw new DataException("Failed to parse record value into JSON map", e);
        }

        String op = (String) jsonMap.get("operationType");
        String topic = record.topic();
        String idField = topicIdField.getOrDefault(topic, "_id");

        if ("delete".equals(op)) {
            Object idVal = extractId(jsonMap, idField);
            return record.newRecord(
                topic,
                record.kafkaPartition(),
                record.keySchema(),
                idVal.toString(),
                null,
                null,
                record.timestamp()
            );
        }

        // Insert/update
        Map<String, Object> fullDoc = getFullDocument(jsonMap);
        Map<String, Object> cleaned = cleanExtendedJson(fullDoc);
        Map<String, Object> whitelisted = new HashMap<>();

        if ("update".equals(op)) {
            applyUpdateWhitelist(jsonMap, cleaned, whitelisted, topic);
        } else {
            for (String field : topicWhitelist.getOrDefault(topic, Set.of())) {
                if (!field.equals(idField) && cleaned.containsKey(field)) {
                    whitelisted.put(field, cleaned.get(field));
                }
            }
        }

        Object idVal = cleaned.get(idField);
        if (idVal == null) {
            throw new DataException("Missing id field '" + idField + "' in topic " + topic);
        }

        return record.newRecord(
            topic,
            record.kafkaPartition(),
            record.keySchema(),
            idVal.toString(),
            null,
            whitelisted,
            record.timestamp()
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getFullDocument(Map<String, Object> jsonMap) {
        Map<String, Object> fullDoc = (Map<String, Object>) jsonMap.get("fullDocument");
        if (fullDoc == null) {
            throw new DataException("Insert/update event missing fullDocument");
        }
        return fullDoc;
    }

    private Object extractId(Map<String, Object> jsonMap, String idField) {
        if (!"_id".equals(idField)) {
            Map<String, Object> before = (Map<String, Object>) jsonMap.get("fullDocumentBeforeChange");
            if (before != null) {
                Map<String, Object> cleanedBefore = cleanExtendedJson(before);
                Object idVal = cleanedBefore.get(idField);
                if (idVal != null) {
                    return idVal;
                }
            }
        }
        Map<String, Object> documentKey = (Map<String, Object>) jsonMap.get("documentKey");
        if (documentKey == null || !documentKey.containsKey("_id")) {
            throw new DataException("Delete event missing documentKey._id");
        }
        Object idObj = documentKey.get("_id");
        if (idObj instanceof Map && ((Map<?, ?>) idObj).containsKey("$oid")) {
            return ((Map<?, ?>) idObj).get("$oid");
        }
        return idObj.toString();
    }

    @SuppressWarnings("unchecked")
    private void applyUpdateWhitelist(Map<String, Object> jsonMap,
                                      Map<String, Object> cleaned,
                                      Map<String, Object> whitelisted,
                                      String topic) {
        Map<String, Object> desc = (Map<String, Object>) jsonMap.get("updateDescription");
        if (desc == null || !desc.containsKey("updatedFields")) {
            throw new DataException("Update event missing updateDescription.updatedFields");
        }
        Map<String, Object> updatedFields = (Map<String, Object>) desc.get("updatedFields");
        for (Map.Entry<String, Object> e : updatedFields.entrySet()) {
            String root = e.getKey().contains(".") ? e.getKey().split("\\.")[0] : e.getKey();
            if (topicWhitelist.getOrDefault(topic, Set.of()).contains(root)) {
                Object fullValue = cleaned.get(root);
                whitelisted.put(root, fullValue != null ? fullValue : e.getValue());
            }
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> cleanExtendedJson(Map<String, Object> input) {
        Map<String, Object> output = new HashMap<>();
        for (Map.Entry<String, Object> entry : input.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (value instanceof Map) {
                output.put(key, simplifyExtendedField((Map<String, Object>) value));
            } else if (value instanceof List) {
                List<Object> list = new ArrayList<>();
                for (Object item : (List<?>) value) {
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

    @Override
    public void close() {
        // no resources to close
    }
}
