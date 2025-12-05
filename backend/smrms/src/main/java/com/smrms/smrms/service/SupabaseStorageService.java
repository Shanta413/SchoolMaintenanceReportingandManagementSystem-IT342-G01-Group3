package com.smrms.smrms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.bucket}")
    private String bucket;

    @Value("${supabase.service_key}")
    private String serviceKey;

    /**
     * Uploads a multipart file to Supabase Storage and returns its PUBLIC URL.
     * Only PDF, DOC, DOCX allowed. The bucket must be public.
     */
    public String upload(MultipartFile file, String type) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        String original = file.getOriginalFilename();
        String safeName = (original == null || original.isBlank() ? "file" : original.replaceAll("\\s+", "_"));
        String ext = original != null ? original.toLowerCase() : "";
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = "application/octet-stream";
        }

        // Check type
        boolean isAllowed = false;
        if ("image".equalsIgnoreCase(type)) {
            isAllowed =
                    contentType.startsWith("image/") &&
                            (ext.endsWith(".png") || ext.endsWith(".jpg") || ext.endsWith(".jpeg") || ext.endsWith(".gif"));
        } else if ("document".equalsIgnoreCase(type)) {
            isAllowed =
                    contentType.equals("application/pdf") ||
                            contentType.equals("application/msword") ||
                            contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
                            ext.endsWith(".pdf") || ext.endsWith(".doc") || ext.endsWith(".docx");
        }
        if (!isAllowed) {
            throw new IllegalArgumentException("File type does not match the allowed types for: " + type);
        }

        String objectPath = UUID.randomUUID() + "_" + safeName;
        URL uploadUrl = new URL(supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath);

        HttpURLConnection connection = (HttpURLConnection) uploadUrl.openConnection();
        connection.setRequestMethod("POST");
        connection.setDoOutput(true);
        connection.setConnectTimeout(8000);
        connection.setReadTimeout(8000);

        connection.setRequestProperty("Authorization", "Bearer " + serviceKey);
        connection.setRequestProperty("apikey", serviceKey);
        connection.setRequestProperty("Content-Type", contentType);
        connection.setRequestProperty("x-upsert", "true");

        try (OutputStream os = connection.getOutputStream()) {
            os.write(file.getBytes());
        }

        int uploadCode = connection.getResponseCode();
        if (uploadCode != 200 && uploadCode != 201) {
            InputStream es = connection.getErrorStream();
            String err = "";
            if (es != null) {
                try (es) {
                    err = new String(es.readAllBytes());
                }
            }
            throw new RuntimeException("Supabase upload failed (HTTP " + uploadCode + "): " + err);
        }
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + objectPath;
    }

}
