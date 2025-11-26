package com.smrms.smrms.service;

import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
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
    public String upload(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // File type check
        String original = file.getOriginalFilename();
        String ext = original != null ? original.toLowerCase() : "";
        String contentType = file.getContentType();
        if (contentType == null || contentType.isBlank()) {
            contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }

        // Check by extension
        boolean isAllowedExt = ext.endsWith(".pdf") || ext.endsWith(".doc") || ext.endsWith(".docx");
        // Check by content type
        boolean isAllowedType =
                contentType.equals("application/pdf") ||
                        contentType.equals("application/msword") ||
                        contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        if (!isAllowedExt || !isAllowedType) {
            throw new IllegalArgumentException("Only PDF, DOC, or DOCX files are allowed.");
        }

        // Build upload URL: POST /storage/v1/object/{bucket}/{path}
        String safeName = (original == null || original.isBlank() ? "document.pdf" : original.replaceAll("\\s+", "_"));
        String objectPath = UUID.randomUUID() + "_" + safeName;
        URL uploadUrl = new URL(supabaseUrl + "/storage/v1/object/" + bucket + "/" + objectPath);

        HttpURLConnection conn = (HttpURLConnection) uploadUrl.openConnection();
        conn.setRequestMethod("POST");
        conn.setDoOutput(true);
        conn.setConnectTimeout(10000);
        conn.setReadTimeout(20000);

        // Required headers
        conn.setRequestProperty("Authorization", "Bearer " + serviceKey);
        conn.setRequestProperty("apikey", serviceKey);
        conn.setRequestProperty("Content-Type", contentType);
        conn.setRequestProperty("x-upsert", "true");

        try (OutputStream os = conn.getOutputStream()) {
            os.write(file.getBytes());
        }

        int code = conn.getResponseCode();
        if (code != 200 && code != 201) {
            String err = readStream(conn.getErrorStream());
            throw new RuntimeException("Supabase upload failed (HTTP " + code + "): " + err);
        }

        // Return public URL
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + objectPath;
    }

    private String readStream(InputStream is) {
        if (is == null) return "";
        try (is; ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[8192];
            int n;
            while ((n = is.read(buf)) != -1) bos.write(buf, 0, n);
            return bos.toString();
        } catch (Exception e) {
            return "";
        }
    }
}
