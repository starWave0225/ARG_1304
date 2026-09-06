"use client";

import { useSyncExternalStore } from "react";
import { getServerStorageFailure, getStorageFailure, subscribeToStorageFailure } from "./browser-storage";

export default function StorageNotice() {
  const failed = useSyncExternalStore(subscribeToStorageFailure, getStorageFailure, getServerStorageFailure);
  if (!failed) return null;
  return <aside className="storage-notice" role="alert">本机存储不可用，进度可能无法保存。请勿关闭页面；“遗忘”操作也需恢复存储权限后重试。</aside>;
}
