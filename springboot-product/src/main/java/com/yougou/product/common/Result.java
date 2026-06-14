package com.yougou.product.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * 统一返回结果封装类
 *
 * @param <T> 泛型：响应数据的类型
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 状态码
     * 200 = 成功
     * 4xx = 客户端参数错误 / 业务错误
     * 5xx = 服务器内部错误
     */
    private int code;

    /**
     * 提示信息
     */
    private String msg;

    /**
     * 响应数据（单个对象或列表）
     */
    private T data;

    /**
     * 分页信息（查询列表时返回）
     */
    private PageInfo page;

    /**
     * 请求时间戳（毫秒）
     */
    private long timestamp;

    // ==================== 快速构建方法 ====================

    /**
     * 成功响应（无数据）
     */
    public static <T> Result<T> success() {
        return success(null);
    }

    /**
     * 成功响应（带数据，无分页）
     */
    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS.getCode());
        result.setMsg(ResultCode.SUCCESS.getMsg());
        result.setData(data);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }

    /**
     * 成功响应（带分页数据）
     */
    public static <T> Result<T> success(T data, PageInfo page) {
        Result<T> result = success(data);
        result.setPage(page);
        return result;
    }

    /**
     * 失败响应（使用 ResultCode 枚举）
     */
    public static <T> Result<T> error(ResultCode resultCode) {
        Result<T> result = new Result<>();
        result.setCode(resultCode.getCode());
        result.setMsg(resultCode.getMsg());
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }

    /**
     * 失败响应（使用自定义错误码和消息）
     */
    public static <T> Result<T> error(int code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }

    /**
     * 业务异常快速抛出
     */
    public static <T> Result<T> fail(BusinessException e) {
        Result<T> result = new Result<>();
        result.setCode(e.getCode());
        result.setMsg(e.getMessage());
        result.setTimestamp(System.currentTimeMillis());
        return result;
    }

    // ==================== 内部类：分页信息 ====================

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        /**
         * 当前页码（从 1 开始）
         */
        private long current;

        /**
         * 每页条数
         */
        private long size;

        /**
         * 总记录数
         */
        private long total;

        /**
         * 总页数
         */
        private long pages;
    }
}
