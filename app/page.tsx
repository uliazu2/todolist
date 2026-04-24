"use client";

import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
  created_at?: string;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Erro ao buscar tarefas:", error);
    else setTodos(data as Todo[]); 
    
    setLoading(false);
  };

  // 3. Tipamos o evento do formulário
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { data, error } = await supabase
      .from("todos")
      .insert([{ task: newTask }])
      .select();

    if (error) {
      console.error("Erro ao inserir:", error);
    } else if (data) {
      setTodos([data[0] as Todo, ...todos]);
      setNewTask("");
    }
  };

  const toggleComplete = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from("todos")
      .update({ is_complete: !currentStatus })
      .eq("id", id);

    if (error) {
      console.error("Erro ao atualizar:", error);
    } else {
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_complete: !currentStatus } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao deletar:", error);
    } else {
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl shadow-2xl p-6">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
          Minhas Tarefas
        </h1>

        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-lg font-semibold"
          >
            Add
          </button>
        </form>

        {loading ? (
          <p className="text-center text-gray-400">Carregando...</p>
        ) : todos.length === 0 ? (
          <p className="text-center text-gray-400">Nenhuma tarefa ainda. </p>
        ) : (
          <ul className="space-y-3">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={todo.is_complete}
                    onChange={() => toggleComplete(todo.id, todo.is_complete)}
                    className="w-5 h-5 rounded border-gray-500 text-blue-500 focus:ring-blue-500 bg-gray-600 cursor-pointer"
                  />
                  <span
                    className={`${
                      todo.is_complete ? "line-through text-gray-500" : ""
                    } transition-all cursor-pointer`}
                    onClick={() => toggleComplete(todo.id, todo.is_complete)}
                  >
                    {todo.task}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-400 hover:text-red-300 font-bold px-2 py-1 bg-red-400/10 hover:bg-red-400/20 rounded transition"
                >
                  X
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}