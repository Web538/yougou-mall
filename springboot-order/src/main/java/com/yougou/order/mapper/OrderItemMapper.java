package com.yougou.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yougou.order.entity.OrderItem;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单明细 Mapper 接口
 */
@Mapper
public interface OrderItemMapper extends BaseMapper<OrderItem> {

    /**
     * 根据订单ID查询明细列表
     */
    List<OrderItem> selectByOrderId(@Param("orderId") Long orderId);

    /**
     * 批量插入订单明细
     */
    int insertBatch(@Param("items") List<OrderItem> items);
}
