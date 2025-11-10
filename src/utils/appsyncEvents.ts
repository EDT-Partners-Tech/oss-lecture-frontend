import { AppSyncPayload } from "../types";

// Custom event system
type EventCallback = (event: any) => void;
const eventCallbacks: { [key: string]: EventCallback[] } = {};

export const subscribeToEvent = (eventName: string, callback: EventCallback) => {
  if (!eventCallbacks[eventName]) {
    eventCallbacks[eventName] = [];
  }
  eventCallbacks[eventName].push(callback);
};

export const unsubscribeFromEvent = (eventName: string, callback: EventCallback) => {
  if (eventCallbacks[eventName]) {
    eventCallbacks[eventName] = eventCallbacks[eventName].filter(cb => cb !== callback);
  }
};

export const triggerEvent = (eventName: string, event?: any) => {
  if (eventCallbacks[eventName]) {
    eventCallbacks[eventName].forEach(callback => callback(event));
  }
};

// Register handlers for different service_id
const eventHandlers: { [key: string]: (payload: AppSyncPayload) => void } = {};

export const registerAppSyncEventHandler = (
  serviceId: string,
  handler: (payload: AppSyncPayload) => void
) => {
  eventHandlers[serviceId] = handler;
};

export const handleAppSyncEvent = (payload: AppSyncPayload) => {
  const { event } = payload;
  if (event?.service_id && eventHandlers[event.service_id]) {
    eventHandlers[event.service_id](payload);
    triggerEvent('notificationUpdate', event);
  }
};

// Event mapping configuration
const eventMappings: { [key: string]: string[] } = {
  'course_generation': ['courseUpdate'],
  'course_deletion': ['courseUpdate', 'kbmUpdate'],
  'course_update': ['courseUpdate'],
  'kbm_generation': ['kbmUpdate'],
  'kbm_update': ['kbmUpdate'],
  'chatbot_conversation': ['chatbotConversation'],
  'start_chatbot': ['chatbotUpdate'],
  'podcast_generation': ['podcastUpdate'],
  'transcriber_generation': ['transcriptionUpdate'],
  'exam_generation': ['examUpdate'],
  'rubric_generator': ['rubricUpdate'],
  'evaluation_generator': ['evaluationUpdate'],
  'topic_analysis': ['topicAnalysisUpdate']
};

// Generic event handler factory
const createEventHandler = (serviceId: string) => (event: AppSyncPayload) => {
  const eventsToTrigger = eventMappings[serviceId] || [];
  eventsToTrigger.forEach(eventName => triggerEvent(eventName, event));
};

// Register all event handlers
Object.keys(eventMappings).forEach(serviceId => {
  registerAppSyncEventHandler(serviceId, createEventHandler(serviceId));
});
