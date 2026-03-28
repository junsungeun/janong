import React, { useState } from 'react';
import { Plus, Check, RotateCcw, Trash2 } from 'lucide-react';
import { db, TABLES } from '../../services/dbService';
import { useList } from '../../hooks/useList';
import { toast } from '../ui/Toast';

export default function CropTasks({ cropId }) {
  const { items: tasks, loading, reload } = useList(TABLES.CROP_TASK, { cropId });
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const todoTasks = tasks.filter((t) => t.status !== 'done');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      await db.add(TABLES.CROP_TASK, { cropId, title: newTitle.trim(), status: 'todo' });
      setNewTitle('');
      reload();
    } catch (err) { toast.error(err.message || '추가에 실패했습니다.'); }
    setAdding(false);
  };

  const handleToggle = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    const updates = { status: newStatus };
    if (newStatus === 'done') updates.completedAt = new Date().toISOString();
    else updates.completedAt = null;
    try {
      await db.update(TABLES.CROP_TASK, task.id, updates);
      reload();
    } catch (err) { toast.error(err.message || '수정에 실패했습니다.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 할 일을 삭제할까요?')) return;
    try {
      await db.delete(TABLES.CROP_TASK, id);
      reload();
    } catch (err) { toast.error(err.message || '삭제에 실패했습니다.'); }
  };

  return (
    <div className="crop-tasks">
      {/* Add new task */}
      <div className="crop-task-add">
        <input
          className="input crop-task-input"
          placeholder="할 일 추가..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="crop-task-add-btn" onClick={handleAdd} disabled={adding || !newTitle.trim()}>
          <Plus size={18} />
        </button>
      </div>

      {/* Todo */}
      {todoTasks.length > 0 && (
        <div className="crop-task-group">
          <span className="crop-task-group-label">미완료 <span className="crop-task-group-count">{todoTasks.length}</span></span>
          {todoTasks.map((task) => (
            <div key={task.id} className="crop-task-item">
              <button className="crop-task-check" onClick={() => handleToggle(task)}>
                <span className="crop-task-check-box" />
              </button>
              <span className="crop-task-title">{task.title}</span>
              <button className="crop-task-delete" onClick={() => handleDelete(task.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Done */}
      {doneTasks.length > 0 && (
        <div className="crop-task-group">
          <span className="crop-task-group-label">완료 <span className="crop-task-group-count">{doneTasks.length}</span></span>
          {doneTasks.map((task) => (
            <div key={task.id} className="crop-task-item crop-task-item--done">
              <button className="crop-task-check crop-task-check--done" onClick={() => handleToggle(task)}>
                <Check size={12} />
              </button>
              <span className="crop-task-title">{task.title}</span>
              <button className="crop-task-delete" onClick={() => handleDelete(task.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {tasks.length === 0 && !loading && (
        <p className="text-sm text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>
          할 일을 추가해보세요
        </p>
      )}
    </div>
  );
}
