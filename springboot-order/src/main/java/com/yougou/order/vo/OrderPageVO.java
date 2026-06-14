package com.yougou.order.vo;

import lombok.Data;

import java.util.List;

/**
 * 订单分页响应VO
 */
@Data
public class OrderPageVO {

    /**
     * 订单列表
     */
    private List<OrderVO> list;

    /**
     * 总记录数
     */
    private Long total;

    /**
     * 当前页
     */
    private Integer page;

    /**
     * 每页大小
     */
    private Integer pageSize;

    /**
     * 总页数
     */
    private Integer totalPages;
}
