<template>
  <view>
    <web-view v-if="status !== 'error' && attempt" :key="attempt.id" :src="gameUrl" @load="attempt.loaded" @error="attempt.failed" />
    <view v-if="status !== 'ready'" class="status-panel">
      <text class="status-panel__label">不存在的房间</text>
      <text class="status-panel__title">{{ status === 'error' ? '连接未完成' : '正在连接终端' }}</text>
      <text class="status-panel__copy">{{ status === 'error' ? '游戏网页暂时无法打开。请检查网络后重试；若持续失败，请确认千岛支持该网页地址。重试不会主动清除存档。' : '首次进入需要加载游戏资源，请稍候。' }}</text>
      <view v-if="status === 'error'" class="status-panel__action tap-active" role="button" @click="retry">重新连接</view>
    </view>
  </view>
</template>

<script setup>
import { onBeforeUnmount, ref, shallowRef } from 'vue'
import { useDidHide, useDidShow } from '@tarojs/taro'

const gameUrl = __GAME_URL__
const status = ref('loading')
const attempt = shallowRef(null)
let sequence = 0
let timeout

function stopTimer() { clearTimeout(timeout) }
function armTimer() {
  stopTimer()
  if (status.value === 'loading') timeout = setTimeout(() => attempt.value?.failed(), 45000)
}
function retry() {
  stopTimer()
  const id = ++sequence
  status.value = 'loading'
  attempt.value = {
    id,
    loaded() {
      if (id !== sequence || status.value !== 'loading') return
      stopTimer()
      status.value = 'ready'
    },
    failed() {
      if (id !== sequence) return
      stopTimer()
      status.value = 'error'
    },
  }
  armTimer()
}

retry()
useDidHide(stopTimer)
useDidShow(armTimer)
onBeforeUnmount(() => { sequence += 1; stopTimer() })
</script>
