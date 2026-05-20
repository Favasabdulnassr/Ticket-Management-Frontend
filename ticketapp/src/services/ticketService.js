import api from './api';

// User APIs
export const createTicket = (data) => api.post('/tickets/', data);
export const getMyTickets = (params) => api.get('/tickets/my/', { params });
export const getTicketDetail = (id) => api.get(`/tickets/${id}/`);

// Admin APIs
export const getAllTickets = (params) => api.get('/admin/tickets/', { params });
export const updateTicket = (id, data) => api.patch(`/admin/tickets/${id}/`, data);
export const resolveTicket = (id, data) => api.patch(`/admin/tickets/${id}/resolve/`, data);
export const deleteTicket = (id) => api.delete(`/admin/tickets/${id}/`);
export const getUsers = () => api.get('/auth/users/');
