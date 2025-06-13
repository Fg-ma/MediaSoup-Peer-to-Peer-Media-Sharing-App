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
import java.util.stream.Collectors;

public class ElasticEmbeddingTransform<R extends ConnectRecord<R>> implements Transformation<R> {
    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final MediaType JSON = MediaType.get("application/json");

    private OkHttpClient httpClient;
    private String apiUrl;
    private String apiKey;
    private String model;
    private Map<String, List<String>> whitelist;

    private static final ConfigDef CONFIG_DEF = new ConfigDef()
        .define("embedding.api.url", ConfigDef.Type.STRING, ConfigDef.Importance.HIGH, "Embeddings API URL")
        .define("embedding.api.key", ConfigDef.Type.PASSWORD, ConfigDef.Importance.HIGH, "API key for embeddings service")
        .define("embedding.model", ConfigDef.Type.STRING, "text-embedding-3-small", ConfigDef.Importance.MEDIUM, "Model name")
        .define("embedding.whitelist", ConfigDef.Type.LIST, Collections.emptyList(), ConfigDef.Importance.MEDIUM,
            "Comma-separated list of topic:field1|field2 mappings, e.g. tbl1:n|x,tbl2:other");

    @Override
    public void configure(Map<String, ?> configs) {
        var cfg = new AbstractConfig(CONFIG_DEF, configs);
        this.apiUrl    = cfg.getString("embedding.api.url");
        this.apiKey    = cfg.getPassword("embedding.api.key").value();
        this.model     = cfg.getString("embedding.model");
        this.httpClient = new OkHttpClient();

        this.whitelist = cfg.getList("embedding.whitelist").stream()
            .map(String::trim)
            .map(entry -> entry.split(":", 2))
            .filter(parts -> parts.length == 2)
            .collect(Collectors.toMap(
                parts -> parts[0],
                parts -> List.of(parts[1].split("\\|"))
            ));
    }

    @Override
    @SuppressWarnings("unchecked")
    public R apply(R record) {
        var value = record.value();
        if (!(value instanceof Map)) {
            return record;
        }
        var map = (Map<String, Object>) value;
        var fields = whitelist.getOrDefault(record.topic(), Collections.emptyList());
        if (fields.isEmpty()) {
            return record;
        }

        for (var field : fields) {
            var raw = map.get(field);
            if (raw == null) continue;
            var text = raw.toString();
            var embedding = fetchEmbedding(text);
            map.put(field + "Vec", embedding);
        }

        return record.newRecord(
            record.topic(), record.kafkaPartition(),
            record.keySchema(), record.key(),
            record.valueSchema(), map,
            record.timestamp()
        );
    }

    private List<Double> fetchEmbedding(String inputText) {
        try {
            var payload = new HashMap<String, Object>();
            payload.put("model", model);
            payload.put("input", List.of(inputText));
            var body = RequestBody.create(JSON, MAPPER.writeValueAsString(payload));
            var request = new Request.Builder()
                .url(apiUrl)
                .addHeader("Authorization", "Bearer " + apiKey)
                .post(body)
                .build();

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
        // no resources to close
    }
}
