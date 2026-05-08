<template>
  <div>
    <h1 class="text-2xl font-serif font-bold text-gray-900 mb-6">Configurações</h1>

    <div v-if="loading" class="flex items-center justify-center py-20">
      <i class="pi pi-spin pi-spinner text-3xl text-teal" />
    </div>

    <div v-else class="space-y-6">
      <!-- Site -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center">
            <i class="pi pi-globe text-teal text-lg" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Site</h2>
            <p class="text-xs text-gray-500">Configurações gerais da loja</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">URL do site</label>
          <input
            v-model="configs.site_url"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="https://www.pequenastrilhas.com.br"
          />
          <p class="text-xs text-gray-400 mt-1">Endereço público da loja. Usado nos emails de confirmação de compra.</p>
        </div>
      </div>

      <!-- Facebook Pixel -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <i class="pi pi-facebook text-blue-600 text-lg" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Facebook Pixel</h2>
            <p class="text-xs text-gray-500">Rastreamento de conversões e remarketing</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pixel ID</label>
            <input
              v-model="configs.facebook_pixel_id"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="Ex: 123456789012345"
            />
            <p class="text-xs text-gray-400 mt-1">Encontre seu Pixel ID no Gerenciador de Eventos do Facebook.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Token de Acesso (API de Conversões)</label>
            <input
              v-model="configs.facebook_pixel_token"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal font-mono"
              placeholder="EAAxxxxxxx..."
            />
            <p class="text-xs text-gray-400 mt-1">Opcional. Para envio de eventos server-side via Conversions API.</p>
          </div>
        </div>
      </div>

      <!-- Google Analytics / Tag -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
            <i class="pi pi-google text-orange-600 text-lg" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Google Analytics</h2>
            <p class="text-xs text-gray-500">Google Analytics 4 (GA4)</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Measurement ID</label>
          <input
            v-model="configs.google_analytics_id"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="G-XXXXXXXXXX"
          />
          <p class="text-xs text-gray-400 mt-1">ID de medição do Google Analytics 4.</p>
        </div>
      </div>

      <!-- Custom scripts -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <i class="pi pi-code text-gray-600 text-lg" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Scripts Personalizados</h2>
            <p class="text-xs text-gray-500">Código injetado no head de todas as páginas</p>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Head Scripts</label>
          <textarea
            v-model="configs.custom_head_scripts"
            rows="5"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal font-mono"
            placeholder="<!-- Cole aqui scripts, pixels ou tags -->"
          />
          <p class="text-xs text-gray-400 mt-1">HTML/JS inserido antes do &lt;/head&gt;. Use com cuidado.</p>
        </div>
      </div>

      <!-- Webhook -->
      <div class="bg-white rounded-xl border border-gray-200 p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
            <i class="pi pi-send text-purple-600 text-lg" />
          </div>
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Webhook de Pedidos</h2>
            <p class="text-xs text-gray-500">Notificação automática a cada mudança de status do pedido</p>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">URL do Webhook</label>
            <input
              v-model="configs.webhook_url"
              type="url"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal font-mono"
              placeholder="https://seuservidor.com/webhook/pedidos"
            />
            <p class="text-xs text-gray-400 mt-1">Endpoint que receberá um POST com o payload do pedido. Deixe em branco para desativar.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Senha / Secret</label>
            <input
              v-model="configs.webhook_secret"
              type="password"
              autocomplete="new-password"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal font-mono"
              placeholder="Chave secreta para validar a requisição"
            />
            <p class="text-xs text-gray-400 mt-1">Opcional. Quando informada, o header <code class="bg-gray-100 px-1 rounded">X-Webhook-Signature</code> será enviado com assinatura HMAC-SHA256.</p>
          </div>
        </div>
      </div>

      <!-- Save button -->
      <div class="flex justify-end">
        <button
          @click="saveAll"
          :disabled="saving"
          class="px-6 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
        >
          <i v-if="saving" class="pi pi-spin pi-spinner" />
          {{ saving ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>

      <!-- Toast -->
      <Transition name="fade">
        <div v-if="saved" class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white text-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <i class="pi pi-check" /> Configurações salvas!
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { $fetch } = useApi()

interface ConfigItem {
  key: string
  value: string | null
  description: string | null
}

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)

const configs = reactive({
  site_url: '',
  facebook_pixel_id: '',
  facebook_pixel_token: '',
  google_analytics_id: '',
  custom_head_scripts: '',
  webhook_url: '',
  webhook_secret: '',
})

const descriptions: Record<string, string> = {
  site_url: 'URL pública do site',
  facebook_pixel_id: 'Facebook Pixel ID',
  facebook_pixel_token: 'Facebook Conversions API Token',
  google_analytics_id: 'Google Analytics Measurement ID',
  custom_head_scripts: 'Scripts personalizados no head',
  webhook_url: 'URL do webhook de mudança de status do pedido',
  webhook_secret: 'Senha/secret para assinatura HMAC-SHA256 do webhook',
}

onMounted(async () => {
  try {
    const data = await $fetch<ConfigItem[]>('/api/admin/configurations')
    for (const item of data) {
      if (item.key in configs) {
        (configs as any)[item.key] = item.value || ''
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function saveAll() {
  saving.value = true
  try {
    const entries = Object.entries(configs) as [string, string][]
    await Promise.all(
      entries.map(([key, value]) =>
        $fetch(`/api/admin/configurations/${key}`, {
          method: 'PUT',
          body: JSON.stringify({ value: value || null, description: descriptions[key] || null }),
        })
      )
    )
    saved.value = true
    setTimeout(() => { saved.value = false }, 2500)
  } catch (e) {
    console.error(e)
    alert('Erro ao salvar configurações')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
