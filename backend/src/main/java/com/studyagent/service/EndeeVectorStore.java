package com.studyagent.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

import java.util.List;
import java.util.Map;

@Service
public class EndeeVectorStore {

    private final RestTemplate restTemplate;
    private final String ENDEE_BASE_URL = "http://localhost:8080/api/v1";

    public EndeeVectorStore() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Checks if the Endee server is healthy.
     */
    public boolean checkHealth() {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(ENDEE_BASE_URL + "/health", String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Insert vectors with their corresponding metadata (e.g., text chunks).
     */
    public void insertVectors(String indexName, List<float[]> vectors, List<Map<String, Object>> payloads) {
        // TODO: Replace with exact Endee insert endpoint based on their API docs.
        String url = ENDEE_BASE_URL + "/index/" + indexName + "/insert";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "vectors", vectors,
            "payloads", payloads
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        restTemplate.postForEntity(url, request, String.class);
    }

    /**
     * Search for similar vectors.
     */
    public List<Map<String, Object>> search(String indexName, float[] queryVector, int topK) {
        // TODO: Replace with exact Endee search endpoint based on their API docs.
        String url = ENDEE_BASE_URL + "/index/" + indexName + "/search";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> requestBody = Map.of(
            "vector", queryVector,
            "top_k", topK
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
            if (response.getBody() != null && response.getBody().containsKey("results")) {
                return (List<Map<String, Object>>) response.getBody().get("results");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return List.of(); // Return empty if failed
    }
}
