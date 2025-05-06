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
    <transition name="icon-scale">
      <div
        v-if="!isChatOpen"
        class="chat-icon"
        @click="toggleChat"
        role="button"
        aria-label="Open Health Assistant chat"
        tabindex="0"
        @keydown.enter="toggleChat"
        @keydown.space.prevent="toggleChat"
      >
        <i class="pi pi-comments"></i>
      </div>
    </transition>

    <!-- Chat Interface -->
    <transition name="chat-slide">
      <div v-if="isChatOpen" class="chat-interface" role="dialog" aria-labelledby="chat-header-title">
        <div class="chat-container">
          <div class="chat-header">
            <div class="header-content">
              <h3 id="chat-header-title">Health Assistant</h3>
              <p class="header-subtitle">Your medical query companion</p>
            </div>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="empty-icon"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>Start a conversation about your health...</p>
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
              rows="2"
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
:root {
  --primary: #9b87f5;
  --primary-dark: #7e69ab;
  --primary-light: #f1efff;
  --neutral-50: #f9fafb;
  --neutral-100: #f3f4f6;
  --neutral-200: #e5e7eb;
  --text-primary: #1a1f2c;
  --text-secondary: #6b7280;
  --border-color: #e2e8f0;
}

.chatbot-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .chat-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    &:focus {
      outline: 2px solid var(--primary);
      outline-offset: 2px;
    }

    i {
      color: white;
      font-size: 2rem;
    }
  }

  .chat-interface {
    width: 400px;
    max-height: 85vh;
    background: white;
    border-radius: 20px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid var(--neutral-200);

    .chat-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .chat-header {
      padding: 1.25rem 1.75rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
      border-radius: 20px 20px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;

      .header-content {
        display: flex;
        flex-direction: column;

        h3 {
          margin: 0;
          color: white;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .header-subtitle {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.85rem;
        }
      }

      .close-button {
        color: white !important;
        width: 36px;
        height: 36px;
        background: rgba(255, 255, 255, 0.15);
        transition: background 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .pi-times {
          color: white !important;
          font-size: 1.2rem;
        }
      }
    }

    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1.75rem;
      background: var(--neutral-50);
      scrollbar-width: thin;
      scrollbar-color: var(--primary) var(--neutral-100);
      min-height: 150px;
      max-height: calc(85vh - 160px);

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: var(--neutral-100);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 3px;
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
          width: 48px;
          height: 48px;
          color: var(--primary);
          margin-bottom: 1rem;
        }

        p {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
        }
      }

      .message-bubble {
        margin-bottom: 1.5rem;
        max-width: 85%;
        animation: slideIn 0.3s ease;
        transition: transform 0.2s ease;

        &:hover {
          transform: translateY(-2px);
        }

        &.bot {
          background: white;
          border: 1px solid var(--border-color);
          border-radius: 16px 16px 16px 4px;
          margin-right: 10%;

          .message-content {
            color: var(--text-primary);
          }
        }

        &.user {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          border-radius: 16px 16px 4px 16px;
          margin-left: auto;
          margin-right: 10%;
          color: white;

          .message-content {
            color: white;
          }
        }

        .message-content {
          padding: 0.9rem 1.2rem;
          border-radius: inherit;
          word-wrap: break-word;
          font-size: 0.95rem;
          line-height: 1.4;
        }

        .message-timestamp {
          display: block;
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-top: 0.5rem;
          text-align: right;
          opacity: 0.8;
        }
      }

      .typing-indicator {
        display: flex;
        gap: 0.4rem;
        padding: 0.9rem;
        margin-right: 10%;

        span {
          width: 10px;
          height: 10px;
          background: var(--primary);
          border-radius: 50%;
          animation: typing 1.4s infinite;

          &:nth-child(2) { animation-delay: 0.2s; }
          &:nth-child(3) { animation-delay: 0.4s; }
        }
      }
    }

    .chat-input {
      padding: 1.25rem;
      border-top: 1px solid var(--border-color);
      display: flex;
      gap: 1rem;
      background: white;
      flex-shrink: 0;

      textarea {
        flex: 1;
        padding: 0.9rem;
        border: 1px solid var(--border-color);
        border-radius: 10px;
        resize: none;
        min-height: 56px;
        font-size: 0.95rem;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(155, 135, 245, 0.15);
        }

        &:disabled {
          background: var(--neutral-50);
          cursor: not-allowed;
        }
      }

      .send-button {
        padding: 0.9rem;
        background: var(--primary);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease, transform 0.2s ease;

        &:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        &:disabled {
          background: var(--neutral-200);
          cursor: not-allowed;
          transform: none;
        }

        .pi-send {
          font-size: 1.1rem;
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
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-6px); opacity: 1; }
}

.chat-slide-enter-active,
.chat-slide-leave-active {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
}

.chat-slide-enter-from,
.chat-slide-leave-to {
  transform: translateY(30px);
  opacity: 0;
}

.icon-scale-enter-active,
.icon-scale-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.icon-scale-enter-from,
.icon-scale-leave-to {
  transform: scale(0.8);
  opacity: 0;
}

@media (max-width: 480px) {
  .chatbot-container {
    bottom: 16px;
    right: 16px;

    .chat-interface {
      width: 100%;
      max-height: 100vh;
      border-radius: 0;
      box-shadow: none;
      border: none;

      .chat-messages {
        max-height: calc(100vh - 180px);
      }

      .chat-header {
        border-radius: 0;
      }
    }

    .chat-icon {
      width: 56px;
      height: 56px;

      i {
        font-size: 1.8rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .chatbot-container {
    .chat-interface {
      width: 90vw;
      max-width: 360px;
    }
  }
}
</style>