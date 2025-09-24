import { useState, useRef, useEffect } from 'react';
import styles from './Chat.module.css';
import { sendMessageToApi } from '../../api/ApiService';
import { ItineraryDisplay } from '../Itinerary/ItineraryDisplay';

interface Message {
  text: string;
  isUser: boolean;
  type?: 'text' | 'itinerary';
}

function isItinerary(text: string): boolean {
  return text.includes('**Dia 1:') && text.includes('| Período |');
}


export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { text: 'Olá! Para onde você gostaria de ir? Me diga o destino e eu criarei um roteiro para você.', isUser: false }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToApi(input);
      const botMessageType = isItinerary(botResponse) ? 'itinerary' : 'text';
      
      const botMessage: Message = { 
        text: botResponse, 
        isUser: false, 
        type: botMessageType 
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      const errorMessage: Message = { text: 'Oops! Tive um problema para me conectar. Tente novamente.', isUser: false };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <h2>Planejador de Viagens IA ✈️</h2>
        <p>Seu assistente pessoal de roteiros</p>
      </div>
      <div className={styles.chatMessages}>
        {messages.map((message, index) => (
          <div key={index} className={`${styles.messageWrapper} ${message.isUser ? styles.user : styles.bot}`}>
            <div className={styles.messageBubble}>
              {message.type === 'itinerary' ? (
                <ItineraryDisplay markdownText={message.text} />
              ) : (
                <p>{message.text}</p>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.bot}`}>
            <div className={`${styles.messageBubble} ${styles.typingIndicator}`}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.chatInputContainer}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ex: 'Um roteiro de 3 dias em Paris'"
          disabled={isLoading}
        />
        <button onClick={handleSendMessage} disabled={isLoading || input.trim() === ''}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};