package com.example.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.apache.kafka.connect.connector.ConnectRecord;
import org.apache.kafka.connect.transforms.Transformation;
import org.apache.kafka.common.config.AbstractConfig;
import org.apache.kafka.common.config.ConfigDef;
import org.apache.kafka.connect.errors.ConnectException;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * SMT to fetch embeddings and prepare records for Qdrant ingestion.
 */
public class QdrantEmbeddingTransform<R extends ConnectRecord<R>> implements Transformation<R> {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final MediaType JSON = MediaType.get("application/json");

    private OkHttpClient httpClient;
    private String embedApiUrl;
    private String embedApiKey;
    private String model;

    private Map<String, List<String>> embeddingWhitelist;
    private Map<String, List<String>> collectionIdMap;
    private Map<String, String> collectionMap;

    private static final ConfigDef CONFIG_DEF = new ConfigDef()
        .define("embedding.api.url", ConfigDef.Type.STRING, ConfigDef.Importance.HIGH, "Embeddings API URL")
        .define("embedding.api.key", ConfigDef.Type.PASSWORD, ConfigDef.Importance.HIGH, "API key for embeddings service")
        .define("embedding.model", ConfigDef.Type.STRING, "text-embedding-3-small", ConfigDef.Importance.MEDIUM, "Model name")
        .define("embedding.whitelist", ConfigDef.Type.LIST, Collections.emptyList(), ConfigDef.Importance.MEDIUM,
            "Comma-separated list of topic:field1|field2 mappings for embedding")
        .define("embedding.collection.id.fields", ConfigDef.Type.LIST, Collections.emptyList(), ConfigDef.Importance.MEDIUM,
            "Comma-separated list of topic:field1|field2 mappings to construct collection ID")
        .define("collection.map", ConfigDef.Type.LIST, Collections.emptyList(), ConfigDef.Importance.MEDIUM,
            "Comma-separated list of topic:collectionName mappings for Qdrant collections");

    @Override
    public void configure(Map<String, ?> configs) {
        var cfg = new AbstractConfig(CONFIG_DEF, configs);
        this.embedApiUrl = cfg.getString("embedding.api.url");
        this.embedApiKey = cfg.getPassword("embedding.api.key").value();
        this.model = cfg.getString("embedding.model");
        this.httpClient = new OkHttpClient();

        this.embeddingWhitelist = parseListMap(cfg.getList("embedding.whitelist"));
        this.collectionIdMap = parseListMap(cfg.getList("embedding.collection.id.fields"));
        this.collectionMap = parseStringMap(cfg.getList("collection.map"));
    }

    private Map<String, List<String>> parseListMap(List<String> entries) {
        return entries.stream()
            .map(String::trim)
            .map(e -> e.split(":", 2))
            .filter(parts -> parts.length == 2)
            .collect(Collectors.toMap(
                parts -> parts[0],
                parts -> List.of(parts[1].split("\\|"))
            ));
    }

    private Map<String, String> parseStringMap(List<String> entries) {
        return entries.stream()
            .map(String::trim)
            .map(e -> e.split(":", 2))
            .filter(parts -> parts.length == 2)
            .collect(Collectors.toMap(
                parts -> parts[0],
                parts -> parts[1]
            ));
    }

    @Override
    @SuppressWarnings("unchecked")
    public R apply(R record) {
        if (record.value() == null) {
            return record;
        }

        Object raw = record.value();
        if (!(raw instanceof Map)) {
            return record;
        }
        var inputMap = (Map<String, Object>) raw;
        var topic = record.topic();
        var embedFields = embeddingWhitelist.getOrDefault(topic, Collections.emptyList());
        if (embedFields.isEmpty()) {
            return record;
        }

        var payload = new HashMap<>(inputMap);
        var vectors = new HashMap<String, List<Double>>();

        for (var field : embedFields) {
            var value = inputMap.get(field);
            if (value == null) continue;
            vectors.put(field + "Vec", fetchEmbedding(value.toString()));
        }

        var idFields = collectionIdMap.getOrDefault(topic, Collections.emptyList());
        String id = buildId(inputMap, idFields);
        idFields.forEach(payload::remove);

        String collectionName = collectionMap.getOrDefault(topic, topic);

        var transformed = new HashMap<String, Object>();
        transformed.put("id", id);
        transformed.put("vector", vectors);
        transformed.put("payload", payload);
        transformed.put("collection_name", collectionName);

        return record.newRecord(
            topic, record.kafkaPartition(),
            record.keySchema(), record.key(),
            null, transformed,
            record.timestamp()
        );
    }

    private String buildId(Map<String, Object> input, List<String> idFields) {
        var sb = new StringBuilder();
        for (var field : idFields) {
            var v = input.get(field);
            if (v != null) {
                sb.append(v).append('_');
            }
        }
        if (sb.length() > 0) sb.setLength(sb.length() - 1);
        var id = sb.toString();
        return id.isEmpty() ? UUID.randomUUID().toString() : id;
    }

    private List<Double> fetchEmbedding(String text) {
        try {
            var payload = Map.of("model", model, "input", List.of(text.trim()));
            var body = RequestBody.create(JSON, MAPPER.writeValueAsString(payload));
            var requestBuilder = new Request.Builder()
                .url(embedApiUrl)
                .addHeader("Content-Type", "application/json");
            if (embedApiKey != null && !embedApiKey.isEmpty()) {
                requestBuilder.addHeader("Authorization", "Bearer " + embedApiKey);
            }
            var request = requestBuilder.post(body).build();

            try (Response response = httpClient.newCall(request).execute()) {
                if (!response.isSuccessful()) {
                    throw new ConnectException("Embedding API error: " + response.code());
                }
                var json = MAPPER.readValue(response.body().string(), Map.class);
                var data = (List<?>) json.get("data");
                var first = (Map<?, ?>) data.get(0);
                return (List<Double>) first.get("embedding");
            }
        } catch (Exception e) {
            throw new ConnectException("Failed to fetch embedding", e);
        }
    }

    @Override
    public ConfigDef config() {
        return CONFIG_DEF;
    }

    @Override
    public void close() {
        // no-op
    }
}
