/**
 * 倒计时子组件 - Countdown.js
 * 父组件（商品详情页）通过 props 向子组件传值
 * 
 * Props 说明:
 * @param {Object} props
 * @param {string|Date} props.endTime   - 倒计时结束时间（必填）
 * @param {string} props.title          - 倒计时标题（默认"距离活动结束"）
 * @param {string} props.size           - 尺寸: 'small'/'medium'/'large'（默认 medium）
 * @param {string} props.theme          - 主题色: 'red'/'orange'/'blue'（默认 red）
 * @param {Function} props.onEnd        - 倒计时结束回调（可选）
 * @param {boolean} props.showIcon      - 是否显示图标（默认 true）
 * 
 * 用法示例（父组件 -> 子组件传值）:
 *   Countdown.render({
 *     endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
 *     title: '距离秒杀结束',
 *     size: 'medium',
 *     theme: 'red',
 *     onEnd: () => console.log('活动结束')
 *   }, 'countdownContainer')
 */

const Countdown = (function() {
  'use strict';

  // 活动计时器注册表（用于管理多个倒计时实例）
  const timers = {};

  // 主题色配置
  const THEMES = {
    red: {
      bg: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
      boxBg: '#ff4d4f',
      borderColor: '#ff4d4f'
    },
    orange: {
      bg: 'linear-gradient(135deg, #ffa94d, #fa8c16)',
      boxBg: '#fa8c16',
      borderColor: '#fa8c16'
    },
    blue: {
      bg: 'linear-gradient(135deg, #74c0fc, #1890ff)',
      boxBg: '#1890ff',
      borderColor: '#1890ff'
    }
  };

  /**
   * 解析时间
   * @param {string|Date} endTime
   * @returns {Date}
   */
  function parseEndTime(endTime) {
    if (!endTime) return null;
    if (endTime instanceof Date) return endTime;
    const t = new Date(endTime);
    return isNaN(t.getTime()) ? null : t;
  }

  /**
   * 计算剩余时间
   * @param {Date} endTime
   * @returns {Object} { days, hours, minutes, seconds, totalMs }
   */
  function getRemaining(endTime) {
    const now = Date.now();
    let totalMs = endTime.getTime() - now;

    if (totalMs <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0, expired: true };
    }

    const days = Math.floor(totalMs / (1000 * 60 * 60 * 24));
    totalMs -= days * 1000 * 60 * 60 * 24;

    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    totalMs -= hours * 1000 * 60 * 60;

    const minutes = Math.floor(totalMs / (1000 * 60));
    totalMs -= minutes * 1000 * 60;

    const seconds = Math.floor(totalMs / 1000);

    return { days, hours, minutes, seconds, totalMs: endTime.getTime() - Date.now(), expired: false };
  }

  /**
   * 渲染单个时间块
   * @param {number} value
   * @param {string} label
   * @param {Object} theme
   * @param {string} size
   */
  function renderTimeBox(value, label, theme, size) {
    const padded = String(value).padStart(2, '0');
    const sizeStyle = size === 'large'
      ? 'font-size: 28px; min-width: 56px; padding: 10px 12px; border-radius: 10px;'
      : size === 'small'
      ? 'font-size: 16px; min-width: 36px; padding: 5px 8px; border-radius: 6px;'
      : 'font-size: 20px; min-width: 46px; padding: 8px 10px; border-radius: 8px;';

    return `
      <div class="countdown-box" style="
        background: ${theme.boxBg};
        color: #fff;
        font-weight: 700;
        ${sizeStyle}
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        box-shadow: 0 2px 8px rgba(255,77,79,0.3);
        margin: 0 2px;
      ">
        <span class="countdown-value" style="font-family: 'Courier New', monospace; line-height: 1;">${padded}</span>
        <span class="countdown-label" style="font-size: 10px; opacity: 0.85; font-weight: 400; margin-top: 2px;">${label}</span>
      </div>
    `;
  }

  /**
   * 渲染 HTML 模板
   * @param {Object} props - 父组件传值
   * @returns {string} HTML 字符串
   */
  function render(props) {
    // 从 props 解构属性
    const {
      endTime,
      title = '距离活动结束',
      size = 'medium',
      theme = 'red',
      showIcon = true
    } = props;

    // 校验传入数据
    const parsedEndTime = parseEndTime(endTime);
    if (!parsedEndTime) {
      return '<div class="countdown" style="color: #999; padding: 8px; font-size: 12px;">⚠️ 时间格式无效</div>';
    }

    // 获取主题配置
    const themeConfig = THEMES[theme] || THEMES.red;

    // 计算初始剩余时间
    const remaining = getRemaining(parsedEndTime);

    // 已过期
    if (remaining.expired) {
      return `<div class="countdown countdown-expired" style="color: #999; padding: 8px; font-size: 13px;">
        ${showIcon ? '⏰ ' : ''}活动已结束
      </div>`;
    }

    // 生成 DOM（带唯一实例 ID，便于 timer 更新）
    const instanceId = 'countdown_' + Math.random().toString(36).substring(2, 8);

    // 根据 size 调整整体样式
    const headerSize = size === 'large' ? '18px' : size === 'small' ? '12px' : '15px';
    const headerPadding = size === 'large' ? '12px 20px' : size === 'small' ? '6px 10px' : '10px 14px';

    return `
      <div id="${instanceId}" class="countdown countdown-${theme} countdown-${size}" data-end-time="${parsedEndTime.toISOString()}" style="
        background: ${themeConfig.bg};
        border-radius: 12px;
        padding: ${headerPadding};
        margin: 12px 0;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 4px 12px rgba(255,77,79,0.2);
      ">
        <div class="countdown-header" style="color: #fff; font-weight: 600; font-size: ${headerSize};">
          ${showIcon ? '⏰ ' : ''}${title}
        </div>
        ${remaining.days > 0 ? `
          <div class="countdown-slot" data-field="days">
            ${renderTimeBox(remaining.days, '天', themeConfig, size)}
          </div>
          <span style="color: #fff; font-weight: 700; font-size: ${headerSize};">:</span>
        ` : ''}
        <div class="countdown-slot" data-field="hours">
          ${renderTimeBox(remaining.hours, '时', themeConfig, size)}
        </div>
        <span style="color: #fff; font-weight: 700; font-size: ${headerSize};">:</span>
        <div class="countdown-slot" data-field="minutes">
          ${renderTimeBox(remaining.minutes, '分', themeConfig, size)}
        </div>
        <span style="color: #fff; font-weight: 700; font-size: ${headerSize};">:</span>
        <div class="countdown-slot" data-field="seconds">
          ${renderTimeBox(remaining.seconds, '秒', themeConfig, size)}
        </div>
      </div>
    `;
  }

  /**
   * 将倒计时渲染到指定容器，并启动定时器
   * @param {Object} props - 父组件传值
   * @param {string|HTMLElement} container - 容器选择器或 DOM 元素
   */
  function renderTo(props, container) {
    const dom = typeof container === 'string' ? document.querySelector(container) : container;
    if (!dom) {
      console.warn('[Countdown] 容器未找到:', container);
      return;
    }

    // 清除该容器上的旧定时器
    const oldId = dom.getAttribute('data-countdown-id');
    if (oldId && timers[oldId]) {
      clearInterval(timers[oldId]);
      delete timers[oldId];
    }

    // 先渲染静态 HTML
    dom.innerHTML = render(props);

    // 启动实时更新
    const parsedEndTime = parseEndTime(props.endTime);
    if (!parsedEndTime) return;

    const countdownEl = dom.querySelector('.countdown');
    if (!countdownEl) return;

    const instanceId = countdownEl.id;
    const theme = THEMES[props.theme] || THEMES.red;
    const size = props.size || 'medium';

    timers[instanceId] = setInterval(() => {
      const remaining = getRemaining(parsedEndTime);

      // 已过期
      if (remaining.expired) {
        clearInterval(timers[instanceId]);
        delete timers[instanceId];
        countdownEl.innerHTML = '<span style="color: #fff; font-size: 14px;">⏰ 活动已结束</span>';
        if (typeof props.onEnd === 'function') {
          props.onEnd();
        }
        return;
      }

      // 动态更新每个时间块（保持动画效果）
      const slotMap = {
        days: remaining.days,
        hours: remaining.hours,
        minutes: remaining.minutes,
        seconds: remaining.seconds
      };

      countdownEl.querySelectorAll('[data-field]').forEach(slot => {
        const field = slot.getAttribute('data-field');
        const value = slotMap[field];
        if (value !== undefined) {
          const valueEl = slot.querySelector('.countdown-value');
          if (valueEl) {
            const newVal = String(value).padStart(2, '0');
            if (valueEl.textContent !== newVal) {
              // 添加闪烁动画
              valueEl.style.transition = 'transform 0.2s ease';
              valueEl.style.transform = 'scale(1.1)';
              setTimeout(() => { valueEl.style.transform = 'scale(1)'; }, 200);
              valueEl.textContent = newVal;
            }
          }
        }
      });

      // 条件渲染天数块（小时可能从0天变1天等复杂场景下，简化处理：仅处理秒变化即可）
    }, 1000);
  }

  /**
   * 停止所有倒计时（页面关闭/销毁时调用）
   */
  function stopAll() {
    for (const id in timers) {
      clearInterval(timers[id]);
    }
    for (const id in timers) {
      delete timers[id];
    }
  }

  // ========== 导出 API ==========
  return {
    render,       // 仅渲染 HTML: Countdown.render({ endTime: ... })
    renderTo,     // 渲染+绑定定时器: Countdown.renderTo(props, '#container')
    stopAll       // 停止所有倒计时
  };
})();

// 导出到全局（父组件可直接调用）
window.Countdown = Countdown;
