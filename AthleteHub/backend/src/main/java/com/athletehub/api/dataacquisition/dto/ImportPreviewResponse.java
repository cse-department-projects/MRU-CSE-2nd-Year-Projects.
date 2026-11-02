package com.athletehub.api.dataacquisition.dto;

import java.util.List;

public class ImportPreviewResponse {
    private String datasetName;
    private int totalRows;
    private int validRows;
    private int invalidRows;
    private int duplicateRows;
    private List<TransformedRecord> previewRecords; // typically top N records

    public ImportPreviewResponse() {}

    public String getDatasetName() { return datasetName; }
    public void setDatasetName(String datasetName) { this.datasetName = datasetName; }

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }

    public int getValidRows() { return validRows; }
    public void setValidRows(int validRows) { this.validRows = validRows; }

    public int getInvalidRows() { return invalidRows; }
    public void setInvalidRows(int invalidRows) { this.invalidRows = invalidRows; }

    public int getDuplicateRows() { return duplicateRows; }
    public void setDuplicateRows(int duplicateRows) { this.duplicateRows = duplicateRows; }

    public List<TransformedRecord> getPreviewRecords() { return previewRecords; }
    public void setPreviewRecords(List<TransformedRecord> previewRecords) { this.previewRecords = previewRecords; }
}
