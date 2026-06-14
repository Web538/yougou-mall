package com.yougou.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yougou.order.entity.Order;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单 Mapper 接口
 */
@Mapper
public interface OrderMapper extends BaseMapper<Order> {

    /**
     * 根据用户ID查询订单列表
     */
    List<Order> selectByUserId(@Param("userId") Long userId);

    /**
     * 根据订单编号查询
     */
    Order selectByOrderNo(@Param("orderNo") String orderNo);
}
