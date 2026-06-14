package com.yougou.order.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.yougou.order.entity.OrderLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 订单日志 Mapper 接口
 */
@Mapper
public interface OrderLogMapper extends BaseMapper<OrderLog> {

    /**
     * 根据订单ID查询日志列表
     */
    List<OrderLog> selectByOrderId(@Param("orderId") Long orderId);
}
