/**
 * 促销标签子组件 - PromotionLabel.js
 * 父组件（商品详情页）通过 props 向子组件传值
 * 
 * Props 说明:
 * @param {Object} props
 * @param {string} props.type      - 促销类型: 'flash'/'discount'/'coupon'/'group'/'newuser'
 * @param {string} props.label     - 促销标签文字（如"限时特惠"/"满减"/"优惠券"）
 * @param {number} props.discount  - 折扣金额或折扣比例（可选）
 * @param {number} props.percent   - 百分比折扣（可选，如 80 = 8折）
 * @param {boolean} props.highlight- 是否高亮显示（可选，默认true）
 * 
 * 用法示例（父组件 -> 子组件传值）:
 *   PromotionLabel.render({
 *     type: 'flash',
 *     label: '限时秒杀',
 *     discount: 200,
 *     highlight: true
 *   })
 */

const PromotionLabel = (function() {
  'use strict';

  // 促销类型配置（预设样式）
  const TYPE_CONFIG = {
    flash: {
      icon: '⚡',
      label: '限时秒杀',
      bgColor: '#ff4d4f',
      textColor: '#fff',
      borderColor: '#ff4d4f'
    },
    discount: {
      icon: '🔥',
      label: '热卖促销',
      bgColor: '#fa8c16',
      textColor: '#fff',
      borderColor: '#fa8c16'
    },
    coupon: {
      icon: '🎟️',
      label: '优惠券',
      bgColor: '#eb2f96',
      textColor: '#fff',
      borderColor: '#eb2f96'
    },
    group: {
      icon: '👥',
      label: '拼团优惠',
      bgColor: '#52c41a',
      textColor: '#fff',
      borderColor: '#52c41a'
    },
    newuser: {
      icon: '🎁',
      label: '新用户专享',
      bgColor: '#1890ff',
      textColor: '#fff',
      borderColor: '#1890ff'
    },
    default: {
      icon: '🏷️',
      label: '促销',
      bgColor: '#722ed1',
      textColor: '#fff',
      borderColor: '#722ed1'
    }
  };

  /**
   * 渲染单个促销标签
   * @param {Object} props - 父组件传递的 props
   * @returns {string} HTML 字符串
   */
  function render(props) {
    if (!props || !props.type) {
      return '';
    }

    // 从 props 解构属性（等价于 Vue 组件中 props: { type, label, discount... }）
    const {
      type,
      label,
      discount,
      percent,
      highlight = true
    } = props;

    // 获取预设样式配置
    const config = TYPE_CONFIG[type] || TYPE_CONFIG.default;
    const displayLabel = label || config.label;

    // 构建折扣描述
    let discountText = '';
    if (discount && discount > 0) {
      discountText = ` 立省 ¥${discount}`;
    }
    if (percent && percent > 0 && percent < 100) {
      discountText = ` ${(percent / 10).toFixed(1)}折`;
    }

    // 渲染样式（根据 highlight 参数决定）
    const bgStyle = highlight
      ? `background: ${config.bgColor}; color: ${config.textColor}; border: 2px solid ${config.borderColor};`
      : `background: ${config.bgColor}20; color: ${config.borderColor}; border: 2px dashed ${config.borderColor};`;

    // 返回 HTML 模板字符串
    return `
      <span
        class="promotion-label promotion-label-${type}"
        data-type="${type}"
        style="${bgStyle} display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; margin-right: 6px; animation: promotionPulse 2s ease-in-out infinite;"
      >
        <span style="margin-right: 4px;">${config.icon}</span>
        <span>${displayLabel}</span>
        ${discountText ? `<span style="margin-left: 6px; font-weight: 700;">${discountText}</span>` : ''}
      </span>
    `;
  }

  /**
   * 批量渲染多个促销标签
   * @param {Array<Object>} propsList - 父组件传递的促销信息数组
   * @returns {string} HTML 字符串
   */
  function renderList(propsList) {
    if (!propsList || !Array.isArray(propsList) || propsList.length === 0) {
      return '';
    }

    return `<div class="promotion-labels" style="display: flex; flex-wrap: wrap; gap: 6px; margin: 12px 0;">
      ${propsList.map(props => render(props)).join('')}
    </div>`;
  }

  /**
   * 获取促销类型配置（供父组件/其他模块查询）
   */
  function getTypeConfig(type) {
    return TYPE_CONFIG[type] || TYPE_CONFIG.default;
  }

  // ========== 导出 API ==========
  return {
    render,        // 基础用法: PromotionLabel.render({ type: 'flash', ... })
    renderList,    // 批量渲染: PromotionLabel.renderList([{...}, {...}])
    getTypeConfig  // 查询配置: PromotionLabel.getTypeConfig('flash')
  };
})();

// 导出到全局（父组件可直接调用）
window.PromotionLabel = PromotionLabel;
