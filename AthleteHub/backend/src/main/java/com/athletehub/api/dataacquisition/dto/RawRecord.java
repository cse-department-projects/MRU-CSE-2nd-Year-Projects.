package com.athletehub.api.dataacquisition.dto;

import java.util.Map;

public class RawRecord {
    private Map<String, String> data;
    private String rawLine;

    public RawRecord(Map<String, String> data, String rawLine) {
        this.data = data;
        this.rawLine = rawLine;
    }

    public Map<String, String> getData() { return data; }
    public void setData(Map<String, String> data) { this.data = data; }

    public String getRawLine() { return rawLine; }
    public void setRawLine(String rawLine) { this.rawLine = rawLine; }
}
