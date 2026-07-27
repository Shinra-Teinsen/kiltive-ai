// =========================================================
// KILTIVE AI — Assistant conversationnel
// Pour l'instant : réponses simulées.
// Prochaine étape : remplacer `getBotReply()` par un appel à
// une Supabase Edge Function qui interroge DeepSeek (la clé
// API ne doit JAMAIS être appelée directement depuis le navigateur).
// =========================================================

export function initChatPage(){
  const body = document.getElementById('chat-body');
  if(body) body.scrollTop = body.scrollHeight;
}

async function getBotReply(userText){
  // TODO: remplacer par un fetch() vers la Supabase Edge Function "chat-ai"
  // qui appelle DeepSeek côté serveur et renvoie la réponse.
  return new Promise(resolve => {
    setTimeout(() => resolve("Mèsi pou mesaj ou. M ap analize sa e m ap reponn ou byen vit. 🌱"), 700);
  });
}

document.addEventListener('submit', async (e) => {
  if(e.target.id !== 'chat-form') return;
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const body = document.getElementById('chat-body');
  const text = input.value.trim();
  if(!text) return;

  const userBubble = document.createElement('div');
  userBubble.className = 'bubble user';
  userBubble.textContent = text;
  body.appendChild(userBubble);
  input.value = '';
  body.scrollTop = body.scrollHeight;

  const reply = await getBotReply(text);
  const botBubble = document.createElement('div');
  botBubble.className = 'bubble bot';
  botBubble.textContent = reply;
  body.appendChild(botBubble);
  body.scrollTop = body.scrollHeight;
});
