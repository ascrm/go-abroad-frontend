import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// 配置通知处理器的前台展示行为
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * 请求通知权限
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  // Android 13+ 需要设置 notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('task-reminder', {
      name: '任务提醒',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#EF4444',
      sound: 'default',
    });
  }

  return true;
}

/**
 * 调度一个任务提醒通知
 * @param taskId 任务ID
 * @param taskTitle 任务标题
 * @param reminderTime 提醒时间
 */
export async function scheduleTaskReminder(
  taskId: number,
  taskTitle: string,
  reminderTime: Date
): Promise<string | null> {
  try {
    // 检查权限
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.warn('通知权限未授予');
      return null;
    }

    // 取消该任务之前可能存在的提醒
    await cancelTaskReminder(taskId);

    // 调度新通知
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '任务提醒',
        body: taskTitle,
        data: { taskId, type: 'task-reminder' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableNotificationTriggerTypes.DATE,
        date: reminderTime,
      },
    });

    return identifier;
  } catch (error) {
    console.error('调度通知失败:', error);
    return null;
  }
}

/**
 * 取消某个任务的所有提醒
 * @param taskId 任务ID
 */
export async function cancelTaskReminder(taskId: number): Promise<void> {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduledNotifications) {
      if (notification.content.data?.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('取消通知失败:', error);
  }
}

/**
 * 取消所有任务提醒
 */
export async function cancelAllTaskReminders(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('取消所有通知失败:', error);
  }
}

/**
 * 添加通知点击监听器
 * @param callback 点击通知时的回调函数，接收 taskId 参数
 */
export function addNotificationResponseListener(
  callback: (taskId: number) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(response => {
    const taskId = response.notification.request.content.data?.taskId as number;
    if (taskId) {
      callback(taskId);
    }
  });
}