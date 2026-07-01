import React, { useState, useEffect } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  // --- P0: PERSISTENCE LAYER STATES ---
  const [items, setItems] = useLocalStorage('cipher-items', []); // Flat tasks & subtasks
  const [goals, setGoals] = useLocalStorage('cipher-goals', []); // Progress metrics
  const [moodItems, setMoodItems] = useLocalStorage('cipher-mood', []); // Freeform grid cards
  
  // P3 & BONUS: FOCUS TIMER & TASK LINKING STATES
  const [timeLeft, setTimeLeft] = useLocalStorage('cipher-timer-time', 1500);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useLocalStorage('cipher-active-task', null);

  // Local Form UI States
  const [taskText, setTaskText] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [goalText, setGoalText] = useState('');
  const [goalTarget, setGoalTarget] = useState(5);

  // P4: MoodBoard Freeform Dragging State
  const [draggedId, setDraggedId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // --- P3: TIMER EFFECT ---
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
      alert("Focus session completed!");
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  // --- P1 & P5: DERIVED STATE CALCULATIONS (Calculated dynamically on render) ---
  const masterTasks = items.filter(item => !item.parentId);
  const totalTasksCount = masterTasks.length;
  const completedTasksCount = masterTasks.filter(t => t.completed).bind ? masterTasks.filter(t => t.completed).length : masterTasks.filter(t => t.completed).length;
  
  // P1: Grouping tasks by date at render time (No separate group field/state)
  const tasksByDate = items.reduce((groups, item) => {
    if (item.parentId) return groups; 
    const dateKey = item.deadline || 'No Deadline';
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(item);
    return groups;
  }, {});

  // P5: Calculate aggregate goal status
  const totalGoalsCount = goals.length;
  const completedGoalsCount = goals.filter(g => g.current >= g.target).length;

  // --- STATE MUTATION HANDLERS ---
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newItem = {
      id: crypto.randomUUID(),
      text: taskText,
      completed: false,
      deadline: selectedParentId ? '' : taskDeadline, 
      parentId: selectedParentId || null // Relational parent mapping
    };

    setItems([...items, newItem]);
    setTaskText('');
    setTaskDeadline('');
    setSelectedParentId('');
  };

  const toggleItemCompletion = (id) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteItem = (id) => {
    // Delete item and any associated children relational elements
    setItems(items.filter(item => item.id !== id && item.parentId !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalText.trim()) return;

    setGoals([...goals, {
      id: crypto.randomUUID(),
      title: goalText,
      current: 0,
      target: Math.max(1, parseInt(goalTarget) || 1)
    }]);
    setGoalText('');
  };

  const incrementGoal = (id) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, current: Math.min(g.current + 1, g.target) } : g
    ));
  };

  // P4: Moodboard Movement Core
  const handleAddMood = () => {
    setMoodItems([...moodItems, {
      id: crypto.randomUUID(),
      text: "✨ New thought",
      x: 40 + Math.random() * 160,
      y: 40 + Math.random() * 160
    }]);
  };

  const handleMouseDown = (id, e) => {
    setDraggedId(id);
    const item = moodItems.find(m => m.id === id);
    if (item) {
      setDragOffset({
        x: e.clientX - item.x,
        y: e.clientY - item.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!draggedId) return;
    setMoodItems(moodItems.map(m => 
      m.id === draggedId 
        ? { ...m, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
        : m
    ));
  };

  return (
    <div 
      style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', color: '#eaeaea', minHeight: '100vh' }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDraggedId(null)}
    >
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#fff', margin: '0 0 10px 0' }}>Cipher MVP</h1>
        <p style={{ color: '#888', margin: 0 }}>Tasks, Goals, Focus & Mood Matrix</p>
      </header>

      {/* P5: DASHBOARD SUMMARY LAYER */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#141414', border: '1px solid #222', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888', fontSize: '0.9rem', uppercase: 'true' }}>Task Completion</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#4caf50' }}>
            {completedTasksCount} / {totalTasksCount}
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#555' }}>Master items resolved</p>
        </div>
        <div style={{ background: '#141414', border: '1px solid #222', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888', fontSize: '0.9rem' }}>Goal Metrics</h3>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#2196f3' }}>
            {completedGoalsCount} / {totalGoalsCount}
          </div>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#555' }}>Targets completely reached</p>
        </div>
        <div style={{ background: '#141414', border: '1px solid #222', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#888', fontSize: '0.9rem' }}>Active Focus Target</h3>
          <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#ff9800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '8px' }}>
            {activeTaskId ? masterTasks.find(t => t.id === activeTaskId)?.text : 'No Active Task'}
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start', marginBottom: '30px' }}>
        
        {/* P1: TASKBOARD COMPONENT */}
        <section style={{ background: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '12px' }}>
          <h2 style={{ marginTop: 0, borderBottom: '1px solid #222', paddingBottom: '10px' }}>📝 Task Board</h2>
          
          <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
            <input value={taskText} onChange={e => setTaskText(e.target.value)} placeholder="Task or subtask content..." required style={{ background: '#1d1d1d', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px' }} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} style={{ flex: 1, background: '#1d1d1d', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px' }} />
              <select value={selectedParentId} onChange={e => setSelectedParentId(e.target.value)} style={{ flex: 1, background: '#1d1d1d', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px' }}>
                <option value="">-- Main Task --</option>
                {masterTasks.map(t => <option key={t.id} value={t.id}>Subtask of: {t.text}</option>)}
              </select>
            </div>
            <button type="submit" style={{ background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>Add Entry</button>
          </form>

          <div>
            {Object.entries(tasksByDate).map(([date, dateTasks]) => (
              <div key={date} style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#888', margin: '0 0 10px 0', borderBottom: '1px solid #222', paddingBottom: '4px' }}>📅 {date}</h4>
                {dateTasks.map(task => (
                  <div key={task.id} style={{ background: '#1d1d1d', padding: '12px', borderRadius: '8px', marginBottom: '8px', border: activeTaskId === task.id ? '1px solid #ff9800' : '1px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                        <input type="checkbox" checked={task.completed} onChange={() => toggleItemCompletion(task.id)} />
                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none', fontWeight: '500' }}>
                          {task.text} {activeTaskId === task.id && '🎯'}
                        </span>
                      </label>
                      <button onClick={() => handleDeleteItem(task.id)} style={{ background: 'transparent', color: '#ff5555', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </div>

                    {/* Subtask Flat relational render matches parent ID links */}
                    {items.filter(sub => sub.parentId === task.id).map(subtask => (
                      <div key={subtask.id} style={{ marginLeft: '25px', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #292929', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input type="checkbox" checked={subtask.completed} onChange={() => toggleItemCompletion(subtask.id)} />
                          <span style={{ textDecoration: subtask.completed ? 'line-through' : 'none', color: '#aaa' }}>{subtask.text}</span>
                        </label>
                        <button onClick={() => handleDeleteItem(subtask.id)} style={{ background: 'transparent', color: '#ff5555', border: 'none', fontSize: '0.8rem', cursor: 'pointer' }}>✕</button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* P3 & BONUS: FOCUSTIMER COMPONENT WITH LINKING */}
          <section style={{ background: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '12px' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #222', paddingBottom: '10px' }}>⏱️ Focus Timer</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', margin: '20px 0' }}>
              <div style={{ fontSize: '3.5rem', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsTimerRunning(!isTimerRunning)} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: isTimerRunning ? '#e53935' : '#4caf50', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isTimerRunning ? 'Pause' : 'Start'}
                </button>
                <button onClick={() => { setIsTimerRunning(false); setTimeLeft(1500); }} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #333', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Reset</button>
              </div>
            </div>

            {/* BONUS: Relational linking configuration logic */}
            <div style={{ background: '#1d1d1d', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ fontSize: '0.9rem', color: '#aaa' }}>Bind Active Task Context:</label>
              <select value={activeTaskId || ''} onChange={(e) => setActiveTaskId(e.target.value || null)} style={{ background: '#141414', color: '#fff', border: '1px solid #333', padding: '6px 12px', borderRadius: '4px' }}>
                <option value="">None Linked</option>
                {masterTasks.map(t => <option key={t.id} value={t.id}>{t.text}</option>)}
              </select>
            </div>
          </section>

          {/* P2: GOALTRACKER COMPONENT */}
          <section style={{ background: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '12px' }}>
            <h2 style={{ marginTop: 0, borderBottom: '1px solid #222', paddingBottom: '10px' }}>🎯 Goal Tracker</h2>
            <form onSubmit={handleAddGoal} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input value={goalText} onChange={e => setGoalText(e.target.value)} placeholder="Metric goal description..." required style={{ flex: 2, background: '#1d1d1d', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px' }} />
              <input type="number" value={goalTarget} onChange={e => setGoalTarget(e.target.value)} min="1" style={{ flex: 0.5, background: '#1d1d1d', color: '#fff', border: '1px solid #333', padding: '10px', borderRadius: '6px' }} />
              <button type="submit" style={{ background: '#fff', color: '#000', fontWeight: 'bold', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer' }}>Create</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {goals.map(g => {
                const percentage = Math.min(100, Math.round((g.current / g.target) * 100));
                return (
                  <div key={g.id} style={{ background: '#1d1d1d', padding: '15px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                      <span style={{ fontWeight: '500' }}>{g.title}</span>
                      <span style={{ color: '#aaa' }}>{g.current} / {g.target} ({percentage}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: '#2a2a2a', borderRadius: '3px', marginBottom: '12px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#2196f3', transition: 'width 0.3s ease' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => incrementGoal(g.id)} disabled={g.current >= g.target} style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px', cursor: g.current >= g.target ? 'not-allowed' : 'pointer' }}>Log Progress (+1)</button>
                      <button onClick={() => setGoals(goals.filter(item => item.id !== g.id))} style={{ padding: '6px 12px', fontSize: '0.85rem', background: 'transparent', border: 'none', color: '#ff5555', cursor: 'pointer' }}>Remove</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* P4: MOODBOARD COMPONENT (FREEFORM CANVAS GENERATOR) */}
      <section style={{ background: '#141414', border: '1px solid #222', padding: '25px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
          <h2 style={{ margin: 0 }}>🎨 Freeform Mood Grid</h2>
          <button onClick={handleAddMood} style={{ background: '#fff', color: '#000', border: 'none', fontWeight: 'bold', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Add Memory Item</button>
        </div>
        
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '450px', 
          background: '#111', 
          overflow: 'hidden', 
          borderRadius: '8px',
          border: '1px dashed #333'
        }}>
          {moodItems.map(m => (
            <div 
              key={m.id} 
              onMouseDown={(e) => handleMouseDown(m.id, e)}
              style={{ 
                position: 'absolute', 
                left: `${m.x}px`, 
                top: `${m.y}px`, 
                padding: '12px', 
                background: '#1d1d1d', 
                border: '1px solid #333', 
                borderRadius: '8px', 
                cursor: 'move',
                userSelect: 'none',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                zIndex: draggedId === m.id ? 1000 : 1
              }}
            >
              <input 
                value={m.text} 
                onChange={(e) => {
                  const txt = e.target.value;
                  setMoodItems(moodItems.map(item => item.id === m.id ? { ...item, text: txt } : item));
                }}
                onMouseDown={(e) => e.stopPropagation()} 
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  borderBottom: '1px solid #444',
                  outline: 'none',
                  fontSize: '0.9rem',
                  width: '130px'
                }}
              />
              <button 
                onMouseDown={(e) => e.stopPropagation()} 
                onClick={() => setMoodItems(moodItems.filter(item => item.id !== m.id))}
                style={{ background: 'transparent', color: '#ff5555', border: 'none', cursor: 'pointer', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}