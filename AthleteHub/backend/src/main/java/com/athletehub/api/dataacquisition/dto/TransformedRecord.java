package com.athletehub.api.dataacquisition.dto;

import com.athletehub.api.entity.Athlete;
import java.util.ArrayList;
import java.util.List;

public class TransformedRecord {
    private RawRecord rawRecord;
    private Athlete athlete;
    private boolean isValid;
    private boolean isDuplicate;
    private List<String> errors;

    public TransformedRecord(RawRecord rawRecord) {
        this.rawRecord = rawRecord;
        this.errors = new ArrayList<>();
        this.isValid = true;
        this.isDuplicate = false;
    }

    public RawRecord getRawRecord() { return rawRecord; }
    public void setRawRecord(RawRecord rawRecord) { this.rawRecord = rawRecord; }

    public Athlete getAthlete() { return athlete; }
    public void setAthlete(Athlete athlete) { this.athlete = athlete; }

    public boolean isValid() { return isValid; }
    public void setValid(boolean valid) { isValid = valid; }

    public boolean isDuplicate() { return isDuplicate; }
    public void setDuplicate(boolean duplicate) { isDuplicate = duplicate; }

    public List<String> getErrors() { return errors; }
    public void addError(String error) {
        this.errors.add(error);
        this.isValid = false;
    }
}
