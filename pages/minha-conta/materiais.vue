<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="section-title text-3xl">Minha Conta</h1>
        <p class="mt-1 text-steel">
          Olá, <span class="font-medium text-teal">{{ auth.user?.name }}</span>
        </p>
      </div>
      <button
        @click="logout"
        class="text-sm text-steel hover:text-red-500 transition-colors flex items-center gap-1.5"
      >
        <i class="pi pi-sign-out" />
        Sair
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-10 border-b border-border">
      <NuxtLink
        to="/minha-conta"
        class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-transparent text-steel hover:text-teal"
      >
        Meus Pedidos
      </NuxtLink>
      <NuxtLink
        to="/minha-conta/materiais"
        class="px-4 py-2.5 text-sm font-medium transition-colors border-b-2 border-coral text-teal"
      >
        Meus Materiais
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 2" :key="i" class="animate-pulse">
        <div class="bg-sand-100 rounded-xl h-10 w-48 mb-4" />
        <div class="bg-sand-100 rounded-xl h-24" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="products.length === 0" class="bg-light rounded-xl p-8 text-center">
      <i class="pi pi-book text-3xl text-salmon mb-3" />
      <p class="text-steel">Você ainda não tem materiais disponíveis.</p>
      <p class="text-sm text-steel mt-1">Seus materiais aparecerão aqui após a confirmação do pagamento.</p>
      <NuxtLink to="/loja" class="btn-primary mt-4 inline-block text-sm">
        Explorar Materiais
      </NuxtLink>
    </div>

    <!-- Products with materials -->
    <div v-else class="space-y-6">
      <div
        v-for="product in products"
        :key="product.productId"
        class="border border-border rounded-xl overflow-hidden hover:border-salmon/50 transition-colors"
      >
        <!-- Product header -->
        <div class="flex items-center gap-4 p-5 bg-sand-50">
          <img
            v-if="product.imageUrl"
            :src="apiBase + product.imageUrl"
            :alt="product.productName"
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0"
          />
          <div
            v-else
            class="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-sand-100 flex items-center justify-center flex-shrink-0"
          >
            <i class="pi pi-image text-xl text-steel" />
          </div>
          <div class="min-w-0">
            <h3 class="font-serif text-lg text-teal truncate">{{ product.productName }}</h3>
            <p class="text-sm text-steel mt-0.5">
              {{ product.materials.length }} {{ product.materials.length === 1 ? 'arquivo' : 'arquivos' }}
            </p>
          </div>
        </div>

        <!-- Materials list -->
        <div class="divide-y divide-border">
          <div
            v-for="material in product.materials"
            :key="material.id"
            class="flex items-center justify-between gap-3 px-5 py-4"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-sand-100 flex items-center justify-center">
                <i :class="fileIcon(material.fileName)" class="text-lg text-coral" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-primary-800 truncate">{{ material.displayName }}</p>
                <p class="text-xs text-steel">{{ formatFileSize(material.fileSize) }}</p>
              </div>
            </div>
            <button
              @click="downloadMaterial(material)"
              :disabled="downloading === material.id"
              class="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                     bg-teal text-white hover:bg-primary-700 active:bg-primary-800
                     disabled:opacity-50 disabled:cursor-wait transition-colors"
            >
              <i :class="downloading === material.id ? 'pi pi-spin pi-spinner' : 'pi pi-download'" />
              <span class="hidden sm:inline">{{ downloading === material.id ? 'Baixando...' : 'Baixar' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const auth = useAuthStore()
const router = useRouter()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

interface MaterialItem {
  id: number
  displayName: string
  fileName: string
  fileSize: number
}

interface PurchasedProduct {
  productId: number
  productName: string
  imageUrl: string | null
  purchasedAt: string
  materials: MaterialItem[]
}

const products = ref<PurchasedProduct[]>([])
const loading = ref(true)
const downloading = ref<number | null>(null)

function logout() {
  auth.logout()
  router.push('/')
}

function fileIcon(fileName: string) {
  if (!fileName) return 'pi pi-file'
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return 'pi pi-file-pdf'
  if (['doc', 'docx'].includes(ext || '')) return 'pi pi-file-word'
  if (['xls', 'xlsx'].includes(ext || '')) return 'pi pi-file-excel'
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'pi pi-image'
  if (['zip', 'rar', '7z'].includes(ext || '')) return 'pi pi-box'
  if (['mp4', 'mov', 'avi'].includes(ext || '')) return 'pi pi-video'
  return 'pi pi-file'
}

function formatFileSize(bytes: number) {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

async function downloadMaterial(material: MaterialItem) {
  downloading.value = material.id
  try {
    const response = await fetch(`${apiBase}/api/customer/materials/${material.id}/download`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'Erro ao baixar arquivo')
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    let downloadName = material.displayName
    const ext = material.fileName?.split('.').pop()
    if (ext && !downloadName.includes('.')) {
      downloadName += '.' + ext
    }
    a.download = downloadName

    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  } catch (e: any) {
    alert(e.message || 'Erro ao baixar material')
  } finally {
    downloading.value = null
  }
}

onMounted(async () => {
  const { $fetch: apiFetch } = useApi()
  try {
    products.value = await apiFetch<PurchasedProduct[]>('/api/customer/materials')
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
})
</script>
