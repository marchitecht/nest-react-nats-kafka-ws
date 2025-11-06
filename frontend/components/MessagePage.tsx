import { memo, useCallback, useEffect, useReducer, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { css } from '@emotion/css';
import { useNavigate } from 'react-router-dom';

export interface Message {
  id: string;
  ts: string;
  body: any;
}

export type State = { live: Message[]; history: Message[] };
export type Action =
  | { type: 'ADD_LIVE'; msg: Message }
  | { type: 'MOVE_LIVE_TO_HISTORY'; id: string }
  | { type: 'ADD_HISTORY'; msg: Message };

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_LIVE':
      if (state.live.some(m => m.id === action.msg.id)) return state;
      return { ...state, live: [action.msg, ...state.live] };
    case 'MOVE_LIVE_TO_HISTORY': {
      const msg = state.live.find(m => m.id === action.id);
      if (!msg) return state;
      return {
        ...state,
        live: state.live.filter(m => m.id !== action.id),
        history: state.history.some(m => m.id === msg.id)
          ? state.history
          : [msg, ...state.history],
      };
    }
    case 'ADD_HISTORY':
      if (state.history.some(m => m.id === action.msg.id)) return state;
      return { ...state, history: [action.msg, ...state.history] };
    default:
      return state;
  }
}

export default function MessagePage() {
  const [state, dispatch] = useReducer(reducer, { live: [], history: [] });
  const stateRef = useRef(state);
  const navigate = useNavigate();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
  const timer = setTimeout(() => {
    const socket: Socket = io('http://localhost:3000', {
      withCredentials: true,          // передаем cookie
      transports: ['websocket', 'polling'], // fallback на polling
    });

    socket.on('connect', () => {
      console.log('✅ WS connected');
    });

    socket.on('disconnect', () => {
      console.log('⚡ WS disconnected');
    });

    // Live-сообщения
    socket.on('live', (msg: Message) => {
      dispatch({ type: 'ADD_LIVE', msg });
    });

    // История
    socket.on('history', (msgs: Message[] | Message) => {
      const arr = Array.isArray(msgs) ? msgs : [msgs];
      arr.forEach((msg) => {
        if (!stateRef.current.history.some(m => m.id === msg.id)) {
          if (stateRef.current.live.some(m => m.id === msg.id)) {
            dispatch({ type: 'MOVE_LIVE_TO_HISTORY', id: msg.id });
          } else {
            dispatch({ type: 'ADD_HISTORY', msg });
          }
        }
      });
    });

    // Запрашиваем историю сразу после подключения
    socket.emit('requestHistory');

    // Очистка при размонтировании
    return () => {
      socket.disconnect();
    };
  }, 100); // таймаут 0.1 секунды

  return () => clearTimeout(timer);
}, []);


  const handleMove = useCallback(
    (id: string) => {
      dispatch({ type: 'MOVE_LIVE_TO_HISTORY', id });
    },
    [dispatch]
  );

    const handleLogout = () => {
    // Редиректим на logout эндпоинт бекенда
    fetch('http://localhost:3000/auth/logout', {
      method: 'POST',
      credentials: 'include', // чтобы cookie удалились
    }).finally(() => {
      navigate('/auth/login');
    });
  };

  return (
    <div>
      <h1>Live + History: {state.live.length + state.history.length}</h1>
              <button onClick={handleLogout}>Logout</button>

      <div style={{ display: 'flex', gap: '10px' }}>
        <section>
          <h2>Live ({state.live.length})</h2>
          <div className={styles.liveContainer}>
            {state.live.map(m => (
              <MemoItem key={m.id} msg={m} isLive onMove={() => handleMove(m.id)} />
            ))}
            {state.live.length === 0 && <div className={styles.empty}>Нет live сообщений</div>}
          </div>
        </section>

        <section>
          <h2>History ({state.history.length})</h2>
          <div className={styles.historyContainer}>
            {state.history.map(m => (
              <MemoItem key={m.id} msg={m} />
            ))}
            {state.history.length === 0 && <div className={styles.empty}>Нет истории</div>}
          </div>
        </section>
      </div>
    </div>
  );
}

export const MemoItem = memo(function MessageItem({
  msg,
  isLive = false,
  onMove,
}: {
  msg: Message;
  isLive?: boolean;
  onMove?: () => void;
}) {
  return (
    <div
      className={css`
        padding: 12px;
        border-bottom: 1px solid ${isLive ? '#0a3d2e' : '#444'};
        background: ${isLive ? 'rgba(0,255,0,0.05)' : 'transparent'};
        display: flex;
        justify-content: space-between;
        align-items: center;
      `}
    >
      <div>
        <div className={styles.timestamp}>{msg.ts}</div>
        <pre className={styles.pre}>
          {typeof msg.body === 'string' ? msg.body : JSON.stringify(msg.body, null, 2)}
        </pre>
        {isLive && <button onClick={onMove}>➡️ Move</button>}
      </div>
    </div>
  );
});

export const styles = {
  liveContainer: css`
    background: #0a3d2e;
    padding: 16px;
    border-radius: 12px;
    min-height: 180px;
    max-height: 35vh;
    overflow-y: auto;
  `,
  historyContainer: css`
    background: #1a1a1a;
    padding: 16px;
    border-radius: 12px;
    min-height: 180px;
    max-height: 35vh;
    overflow-y: auto;
  `,
  empty: css`
    color: #666;
    text-align: center;
    padding: 20px;
  `,
  timestamp: css`
    font-size: 11px;
    color: #888;
    margin-bottom: 4px;
    font-family: 'JetBrains Mono', monospace;
  `,
  pre: css`
    margin: 0;
    font-size: 13px;
    font-family: 'JetBrains Mono', monospace;
  `,
};
