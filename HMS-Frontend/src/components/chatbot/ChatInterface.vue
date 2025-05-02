<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import { chatbotService } from '../../services/api'

// Props
interface Props {
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Describe your symptoms...',
})

// State
const toast = useToast()
const message = ref('')
const chatHistory = ref<Array<{ id: string; text: string; sender: 'user' | 'bot'; timestamp: Date }>>([])
const loading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)
const isChatOpen = ref(false)

// Toggle chat visibility
const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}

// Fetch previous chat history on mount
onMounted(() => {
  fetchChatHistory()
})

// Fetch previous chat history
const fetchChatHistory = async () => {
  try {
    const response = await chatbotService.getHistory()
    if (response.data && response.data.length > 0) {
      chatHistory.value.push({
        id: generateId(),
        text: '--- Previous Conversation ---',
        sender: 'bot',
        timestamp: new Date(),
      })
      response.data.forEach((msg: any) => {
        chatHistory.value.push({
          id: msg.id,
          text: msg.text,
          sender: msg.sender,
          timestamp: new Date(msg.timestamp),
        })
      })
    }
  } catch (error) {
    console.error('Error fetching chat history:', error)
  }
}

// Send message
// Send message to API
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

  // Show loading state
  loading.value = true

  try {
    // Send to API
    const response = await fetch('http://localhost:3000/chatbot/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessageText })
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await response.json()

    // Add bot response
    const botMessage = {
      id: generateId(),
      text: data.message,
      sender: 'bot',
      timestamp: new Date()
    }

    chatHistory.value.push(botMessage)
  } catch (error) {
    console.error('Error:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to get response from chatbot',
      life: 3000
    })
    chatHistory.value.push({
      id: generateId(),
      text: 'Sorry, I couldn\'t process your request. Please try again later.',
      sender: 'bot',
      timestamp: new Date()
    })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

// Generate random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15)
}

// Scroll to bottom
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
  <div class="chatbot-container" :aria-hidden="!isChatOpen">
    <!-- Chat Icon -->
    <transition name="icon-fade">
      <div
        v-if="!isChatOpen"
        class="chat-icon"
        @click="toggleChat"
        role="button"
        aria-label="Open chat"
        tabindex="0"
        @keydown.enter="toggleChat"
      >
        <i class="pi pi-comments"></i>
      </div>
    </transition>

    <!-- Chat Interface -->
    <transition name="chat-slide">
      <div v-if="isChatOpen" class="chat-interface" role="dialog" aria-labelledby="chat-header-title">
        <div class="chat-container">
          <div class="chat-header">
            <h3 id="chat-header-title">Health Assistant</h3>
            <Button
              icon="pi pi-times"
              class="p-button-text p-button-rounded close-button"
              @click="toggleChat"
              aria-label="Close chat"
            />
          </div>

          <div class="chat-messages" ref="chatContainer">
            <!-- Empty State -->
            <div v-if="!chatHistory.length && !loading" class="empty-state">
              <i class="pi pi-comments empty-icon"></i>
              <p>Start chatting...</p>
            </div>

            <!-- Messages -->
            <div
              v-for="msg in chatHistory"
              :key="msg.id"
              :class="[msg.sender, 'message-bubble']"
              :aria-label="msg.sender === 'user' ? 'Your message' : 'Assistant message'"
            >
              <div class="message-content">
                {{ msg.text }}
              </div>
              <small class="message-timestamp">{{ formatTime(msg.timestamp) }}</small>
            </div>

            <!-- Typing Indicator -->
            <div v-if="loading" class="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>

          <div class="chat-input">
            <textarea
              v-model="message"
              :placeholder="props.placeholder"
              @keypress.enter.prevent="sendMessage"
              :disabled="loading"
              aria-label="Type your message"
            ></textarea>
            <Button
              icon="pi pi-send"
              @click="sendMessage"
              :disabled="loading || !message.trim()"
              class="send-button"
              aria-label="Send message"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;

  .chat-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    i {
      color: white;
      font-size: 1.8rem;
    }
  }

  .chat-interface {
    width: 380px;
    max-height: 80vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
      border-radius: 16px 16px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      h3 {
        margin: 0;
        color: white;
        font-size: 1.2rem;
      }

      .close-button {
        color: white !important;
        font-size: 1.2rem;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.2);
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .pi-times {
          color: white !important;
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      background: var(--neutral-50);
      scrollbar-width: thin;
      scrollbar-color: var(--primary) var(--neutral-100);
      min-height: 100px; // Ensure container has height for scrolling
      max-height: calc(80vh - 120px); // Adjust for header and input

      &::-webkit-scrollbar {
        width: 8px;
      }

      &::-webkit-scrollbar-track {
        background: var(--neutral-100);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 4px;
      }

      &::-webkit-scrollbar-thumb:hover {
        background: var(--primary-dark);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-secondary);
        text-align: center;

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--primary);
        }

        p {
          margin: 0;
          font-size: 1rem;
        }
      }

      .message-bubble {
        margin-bottom: 1.2rem;
        animation: slideIn 0.3s ease;

        &.bot {
          background: var(--primary-light);
          margin-left: 20%;
          border-radius: 12px 12px 12px 0;

          .message-content {
            color: var(--primary-dark);
          }
        }

        &.user {
          background: var(--primary);
          margin-right: 10%;
          margin-left: 10%;
          border-radius: 12px 12px 0 12px;
          color: white;

          .message-content {
            color: white;
          }
        }

        .message-content {
          padding: 0.8rem 1rem;
          border-radius: inherit;
          word-wrap: break-word;
        }

        .message-timestamp {
          display: block;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-top: 0.4rem;
          text-align: right;
        }
      }

      .typing-indicator {
        display: flex;
        gap: 0.3rem;
        padding: 0.8rem;
        margin-left: 20%;

        span {
          width: 8px;
          height: 8px;
          background: var(--primary);
          border-radius: 50%;
          animation: typing 1.2s infinite;

          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.4s; }
        }
      }
    }

    .chat-input {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 0.8rem;
      background: white;
      flex-shrink: 0;

      textarea {
        flex: 1;
        padding: 0.8rem;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        resize: none;
        min-height: 48px;
        font-size: 0.9rem;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
        }

        &:disabled {
          background: var(--neutral-50);
        }
      }

      .send-button {
        padding: 0.8rem;
        background: var(--primary);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: var(--primary-dark);
        }

        &:disabled {
          background: var(--neutral-200);
          cursor: not-allowed;
        }
      }
    }
  }
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes typing {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.3s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .chatbot-container {
    .chat-interface {
      width: 100%;
      max-height: 100vh;
      bottom: 0;
      right: 0;
      border-radius: 0;

      .chat-messages {
        max-height: calc(100vh - 120px); // Adjust for mobile
      }
    }

    .chat-icon {
      bottom: 15px;
      right: 15px;
    }
  }
}
</style>