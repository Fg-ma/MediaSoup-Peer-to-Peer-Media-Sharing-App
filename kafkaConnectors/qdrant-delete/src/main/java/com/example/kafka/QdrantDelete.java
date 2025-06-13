package com.example.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import okhttp3.*;
import org.apache.kafka.connect.connector.ConnectRecord;
import org.apache.kafka.connect.transforms.Transformation;
import org.apache.kafka.common.config.AbstractConfig;
import org.apache.kafka.common.config.ConfigDef;

import java.util.*;

public class QdrantDelete<R extends ConnectRecord<R>> implements Transformation<R> {
    private static final ObjectMapper mapper = new ObjectMapper();
    private OkHttpClient http;

    private String qdrantApiUrl;
    private String qdrantApiKey;
    private Map<String, String> collectionMap;

    private static final ConfigDef CONFIG_DEF = new ConfigDef()
        .define("collection.map", ConfigDef.Type.LIST, Collections.emptyList(), ConfigDef.Importance.MEDIUM,
                "Comma-separated list of topic:collectionName mappings for Qdrant collections")
        .define("qdrant.api.url", ConfigDef.Type.STRING, ConfigDef.Importance.HIGH, "Qdrant API base URL")
        .define("qdrant.api.key", ConfigDef.Type.PASSWORD, "", ConfigDef.Importance.MEDIUM,
                "Optional Qdrant API key if your instance is secured");

    @Override
    public void configure(Map<String, ?> configs) {
        AbstractConfig cfg = new AbstractConfig(CONFIG_DEF, configs);

        qdrantApiUrl = cfg.getString("qdrant.api.url");
        qdrantApiKey = cfg.getPassword("qdrant.api.key").value();

        http = new OkHttpClient();
        collectionMap = parseStringMap(cfg.getList("collection.map"));
    }

    private Map<String, String> parseStringMap(List<String> entries) {
        Map<String, String> map = new HashMap<>();
        for (String entry : entries) {
            String[] parts = entry.split(":", 2);
            if (parts.length == 2) {
                map.put(parts[0], parts[1]);
            }
        }
        return map;
    }

    private void deletePointFromQdrant(String collectionName, String pointId) {
        try {
            String url = String.format("%s/collections/%s/points/delete", qdrantApiUrl, collectionName);
            Map<String, Object> payload = Map.of("points", List.of(pointId));

            RequestBody body = RequestBody.create(
                MediaType.get("application/json"),
                mapper.writeValueAsString(payload)
            );

            Request.Builder builder = new Request.Builder()
                .url(url)
                .addHeader("Content-Type", "application/json");

            if (qdrantApiKey != null && !qdrantApiKey.isEmpty()) {
                builder.addHeader("Authorization", "Bearer " + qdrantApiKey);
            }

            Request request = builder.post(body).build();

            try (Response response = http.newCall(request).execute()) {
                // Ignoring response status
            }
        } catch (Exception e) {
            // Suppressing exceptions
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public R apply(R record) {
        if (record.value() == null) {
            String topic = record.topic();
            String collectionName = collectionMap.getOrDefault(topic, topic);
            String pointId = record.key() != null ? record.key().toString() : null;

            if (pointId != null) {
                deletePointFromQdrant(collectionName, pointId);
            }
            return null;
        }

        return record;
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

