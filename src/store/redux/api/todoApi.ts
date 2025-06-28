import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiTodo } from '@typings/todo';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export const todoApi = createApi({
  reducerPath: 'todoApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
  }),
  tagTypes: ['Todo'],
  endpoints: builder => ({
    getTodos: builder.query<ApiTodo[], void>({
      query: () => '/todos?_limit=10',
      providesTags: ['Todo'],
    }),
    createTodo: builder.mutation<ApiTodo, Partial<ApiTodo>>({
      query: todo => ({
        url: '/todos',
        method: 'POST',
        body: todo,
      }),
      invalidatesTags: ['Todo'],
    }),
    updateTodo: builder.mutation<
      ApiTodo,
      { id: number; todo: Partial<ApiTodo> }
    >({
      query: ({ id, todo }) => ({
        url: `/todos/${id}`,
        method: 'PUT',
        body: todo,
      }),
      invalidatesTags: ['Todo'],
    }),
    deleteTodo: builder.mutation<void, number>({
      query: id => ({
        url: `/todos/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Todo'],
    }),
  }),
});

export const {
  useGetTodosQuery,
  useCreateTodoMutation,
  useUpdateTodoMutation,
  useDeleteTodoMutation,
} = todoApi;
