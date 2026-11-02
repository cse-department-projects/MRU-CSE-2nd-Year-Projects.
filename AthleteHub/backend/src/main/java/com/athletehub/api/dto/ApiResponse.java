package com.athletehub.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    private String status;
    private String message;
    private T data;
    private Object errors;

    public ApiResponse() {}

    public ApiResponse(String status, String message, T data, Object errors) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.errors = errors;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public Object getErrors() {
        return errors;
    }

    public void setErrors(Object errors) {
        this.errors = errors;
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>("success", message, data, null);
    }

    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>("success", message, null, null);
    }

    public static ApiResponse<?> error(String message, Object errors) {
        return new ApiResponse<>("error", message, null, errors);
    }

    public static ApiResponse<?> error(String message) {
        return new ApiResponse<>("error", message, null, null);
    }
}
