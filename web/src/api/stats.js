import api from './axios';

export async function getTotalIssuesStats() {
  const { data } = await api.get('/admin/stats/total-issues');
  return data;
}
export async function getStatusSummary() {
  const { data } = await api.get('/admin/stats/status-summary');
  return data;
}
export async function getPrioritySummary() {
  const { data } = await api.get('/admin/stats/priority-summary');
  return data;
}
export async function getIssuesByBuilding() {
  const { data } = await api.get('/admin/stats/issues-by-building');
  return data;
}
