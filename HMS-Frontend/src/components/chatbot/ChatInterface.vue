<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { chatbotService } from '../../services/api'

// Props
interface Props {
  placeholder?: string
  initialMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Describe your symptoms...',
  initialMessage: 'Hi there! I\'m your healthcare assistant. How can I help you today?'
})

// State
const toast = useToast()
const message = ref('')
const chatHistory = ref<Array<{id: string, text: string, sender: 'user' | 'bot', timestamp: Date}>>([])
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

// Add initial bot message
onMounted(() => {
  // Add welcome message
  if (props.initialMessage) {
    chatHistory.value.push({
      id: generateId(),
      text: props.initialMessage,
      sender: 'bot',
      timestamp: new Date()
    })
  }
  
  // Fetch chat history
  fetchChatHistory()
})

// Fetch previous chat history
const fetchChatHistory = async () => {
  try {
    const response = await chatbotService.getHistory()
    
    if (response.data && response.data.length > 0) {
      // Add a separator
      chatHistory.value.push({
        id: generateId(),
        text: '--- Previous Conversation ---',
        sender: 'bot',
        timestamp: new Date()
      })
      
      // Add previous messages
      response.data.forEach((msg: any) => {
        chatHistory.value.push({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp)
        })
      })
    }
    
    // Scroll to bottom
    scrollToBottom()
  } catch (error) {
    console.error('Error fetching chat history:', error)
  }
}

// Send message
const sendMessage = async () => {
  if (!message.value.trim()) return
  
  // Add user message to chat
  const userMessageText = message.value.trim()
  const userMessage = {
    id: generateId(),
    text: userMessageText,
    sender: 'user',
    timestamp: new Date()
  }
  
  chatHistory.value.push(userMessage)
  message.value = ''
  
  // Scroll to bottom after user message
  await scrollToBottom()
  
  // Show typing indicator
  loading.value = true
  
  try {
    // Send to API
    const response = await chatbotService.sendMessage(userMessageText)
    
    // Add bot response
    const botMessage = {
      id: generateId(),
      text: response.data.message || 'I apologize, but I couldn\'t process your request at this time.',
      sender: 'bot',
      timestamp: new Date()
    }
    
    // Simulate typing delay
    setTimeout(() => {
      chatHistory.value.push(botMessage)
      loading.value = false
      
      // Scroll to bottom after bot response
      scrollToBottom()
    }, 1000)
  } catch (error) {
    console.error('Error sending message:', error)
    
    // Add error message
    chatHistory.value.push({
      id: generateId(),
      text: 'Sorry, there was an error processing your request. Please try again later.',
      sender: 'bot',
      timestamp: new Date()
    })
    
    loading.value = false
    scrollToBottom()
    
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to send message to the chatbot',
      life: 3000
    })
  }
}

// Generate random ID for messages
const generateId = () => {
  return Math.random().toString(36).substring(2, 15)
}

// Scroll chat to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Format time
const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="chat-interface">
    <div class="chat-container" ref="chatContainer">
      <div class="messages">
        <div 
          v-for="msg in chatHistory" 
          :key="msg.id" 
          class="message" 
          :class="msg.sender"
        >
          <div class="message-content">
            <div class="message-text" v-html="msg.text"></div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
        
        <!-- Typing indicator -->
        <div v-if="loading" class="message bot">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="chat-input">
      <input
        v-model="message"
        type="text"
        :placeholder="placeholder"
        @keyup.enter="sendMessage"
      />
      <Button
        icon="pi pi-send"
        rounded
        raised
        aria-label="Send"
        :disabled="!message.trim() || loading"
        @click="sendMessage"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  
  .chat-container {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-3);
    
    .messages {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      
      .message {
        display: flex;
        max-width: 80%;
        
        &.user {
          align-self: flex-end;
          
          .message-content {
            background-color: var(--primary);
            color: white;
            border-radius: var(--radius-lg) var(--radius-lg) 0 var(--radius-lg);
            
            .message-time {
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }
        
        &.bot {
          align-self: flex-start;
          
          .message-content {
            background-color: var(--neutral-100);
            color: var(--neutral-800);
            border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) 0;
          }
        }
        
        .message-content {
          padding: var(--space-2) var(--space-3);
          position: relative;
          
          .message-text {
            margin-bottom: var(--space-1);
            line-height: 1.4;
            white-space: pre-wrap;
          }
          
          .message-time {
            font-size: var(--font-xs);
            color: var(--neutral-500);
            text-align: right;
          }
          
          .typing-indicator {
            display: flex;
            gap: 4px;
            padding: var(--space-1) 0;
            
            span {
              display: inline-block;
              width: 8px;
              height: 8px;
              background-color: var(--neutral-400);
              border-radius: 50%;
              
              &:nth-child(1) {
                animation: blink 1s infinite 0.2s;
              }
              
              &:nth-child(2) {
                animation: blink 1s infinite 0.4s;
              }
              
              &:nth-child(3) {
                animation: blink 1s infinite 0.6s;
              }
            }
          }
        }
      }
    }
  }
  
  .chat-input {
    display: flex;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    background-color: white;
    border-top: 1px solid var(--neutral-200);
    
    input {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--neutral-300);
      border-radius: var(--radius-md);
      margin-right: var(--space-2);
      font-size: var(--font-md);
      transition: border-color var(--transition-fast);
      
      &:focus {
        outline: none;
        border-color: var(--primary);
        box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
      }
    }
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.75);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>