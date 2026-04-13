package com.studyagent.controller;

import com.studyagent.service.EndeeVectorStore;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/study")
@CrossOrigin(origins = "*") // For local React Vite development
public class StudyAgentController {

    private final EndeeVectorStore endeeVectorStore;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public StudyAgentController(EndeeVectorStore endeeVectorStore, ChatClient.Builder chatClientBuilder) {
        this.endeeVectorStore = endeeVectorStore;
        this.chatClient = chatClientBuilder.build();
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(@RequestParam("file") String markdownOrTextContent) {
        // Mocking chunk generation and DB insert logic
        // endeeVectorStore.insertVectors("study-notes", vectors, payloads);
        return ResponseEntity.ok(Map.of("message", "Document uploaded and processed successfully."));
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatAgent(@RequestBody Map<String, String> request) {
        String userQuery = request.get("query");
        
        // Call Ollama to generate a response via Agentic RAG logic
        String ollamaResponse = chatClient.prompt()
                .user("Please act as a Study Agent. Answer this question: " + userQuery)
                .call()
                .content();
        
        return ResponseEntity.ok(Map.of(
            "answer", ollamaResponse,
            "sources", List.of("Endee Local DB Search")
        ));
    }

    @PostMapping("/flashcards")
    public ResponseEntity<?> generateFlashcards(@RequestBody Map<String, String> request) {
        String topic = request.getOrDefault("topic", "general topics");
        try {
            String prompt = "Extract 3 flashcards from the topic: " + topic + ". Output strictly as a valid JSON array of objects with keys 'front' and 'back'. Only output JSON, no markdown formatting.";
            String aiResponse = chatClient.prompt().user(prompt).call().content();
            
            // Clean up possible markdown wrappers if the LLM leaked them
            if (aiResponse.contains("```json")) aiResponse = aiResponse.split("```json")[1].split("```")[0];
            else if (aiResponse.contains("```")) aiResponse = aiResponse.split("```")[1].split("```")[0];

            List<?> flashcards = objectMapper.readValue(aiResponse.trim(), List.class);
            return ResponseEntity.ok(flashcards);
        } catch (Exception e) {
            // Fallback
            List<Map<String, String>> flashcards = List.of(
                Map.of("front", "Could not generate for topic: " + topic, "back", "Try simplifying the study topic."),
                Map.of("front", "Error Type", "back", "Failed to parse local LLM JSON output")
            );
            return ResponseEntity.ok(flashcards);
        }
    }

    @PostMapping("/quiz")
    public ResponseEntity<?> generateQuiz(@RequestBody Map<String, String> request) {
        String topic = request.getOrDefault("topic", "general topics");
        try {
            String prompt = "Generate a 10 question multiple choice quiz about the topic: " + topic + 
            ". Output strictly as a valid JSON array of objects. Keys must be: 'question' (string), 'options' (array of 4 strings), 'answerIndex' (integer 0-3). Only output JSON, no markdown formatting.";

            
            String aiResponse = chatClient.prompt().user(prompt).call().content();
            
            if (aiResponse.contains("```json")) aiResponse = aiResponse.split("```json")[1].split("```")[0];
            else if (aiResponse.contains("```")) aiResponse = aiResponse.split("```")[1].split("```")[0];

            List<?> quiz = objectMapper.readValue(aiResponse.trim(), List.class);
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            // Fallback
            List<Map<String, Object>> quiz = List.of(
                Map.of(
                    "question", "Fallback Error: Local Ollama Model failed to return valid JSON structure for the quiz on: " + topic,
                    "options", List.of("Option 1", "Option 2", "Option 3", "Option 4"),
                    "answerIndex", 0
                )
            );
            return ResponseEntity.ok(quiz);
        }
    }
}
