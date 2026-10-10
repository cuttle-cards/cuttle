import { defineStore } from 'pinia';
import { ref } from 'vue';

async function request(url, body) {
  const response = await fetch(url, {
    method: body ? 'POST' : 'GET',
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? 'emailPreference.error.sendFailed');
  }
  return data;
}

export const useUserEmailStore = defineStore('userEmail', () => {
  const email = ref(null);
  const promotional = ref(false);

  async function requestEmail() {
    const data = await request('/api/user/email');
    email.value = data.email;
    promotional.value = data.promotional;
  }

  async function requestCode(newEmail, isPromotional) {
    await request('/api/user/email/request-code', { email: newEmail, promotional: isPromotional });
  }

  async function verifyCode(code) {
    const data = await request('/api/user/email/verify', { code });
    email.value = data.email;
    promotional.value = data.promotional;
  }

  return {
    email,
    promotional,
    requestEmail,
    requestCode,
    verifyCode,
  };
});
