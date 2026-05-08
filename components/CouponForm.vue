<template>
  <div class="space-y-6">
    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Informações do Cupom</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Código</label>
          <input
            v-model="form.code"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="EX: DESCONTO10"
            @input="form.code = form.code.toUpperCase().replace(/\s/g, '')"
          />
        </div>
        <div class="flex items-center gap-3 self-end pb-1">
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.active" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
          <span class="text-sm text-gray-700">Ativo</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Desconto</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de desconto</label>
          <select v-model="form.discountType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal">
            <option value="PERCENTAGE">Porcentagem (%)</option>
            <option value="FIXED_VALUE">Valor fixo (R$)</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor do desconto</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">{{ form.discountType === 'PERCENTAGE' ? '%' : 'R$' }}</span>
            <input
              v-model="form.discountValue"
              type="number"
              step="0.01"
              min="0"
              required
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Aplicação</label>
          <select v-model="form.applicationType" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal">
            <option value="TOTAL">No total da compra</option>
            <option value="PER_PRODUCT">Por produto</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor mínimo do pedido</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">R$</span>
            <input
              v-model="form.minOrderValue"
              type="number"
              step="0.01"
              min="0"
              class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
              placeholder="Sem mínimo"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Limites</h2>
      <div class="grid sm:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Máximo de usos</label>
          <input
            v-model="form.maxUses"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="Ilimitado"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Máximo por CPF</label>
          <input
            v-model="form.maxUsesPerCpf"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            placeholder="Ilimitado"
          />
        </div>
        <div class="flex items-center gap-3 self-end pb-1">
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.combinable" type="checkbox" class="sr-only peer" />
            <div class="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:bg-teal transition-colors after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
          </label>
          <span class="text-sm text-gray-700">Combinável</span>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Validade</h2>
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Válido a partir de</label>
          <input
            v-model="form.validFrom"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Válido até</label>
          <input
            v-model="form.validUntil"
            type="datetime-local"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
          />
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-2">Deixe em branco para não ter restrição de data.</p>
    </div>

    <div class="flex items-center justify-end gap-3">
      <NuxtLink to="/admin/cupons" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
        Cancelar
      </NuxtLink>
      <button
        @click="save"
        :disabled="saving || !isValid"
        class="px-6 py-2 text-sm font-medium text-white bg-teal rounded-lg hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
      >
        <i v-if="saving" class="pi pi-spin pi-spinner" />
        {{ saving ? 'Salvando...' : 'Salvar' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CouponData {
  id: number
  code: string
  discountType: string
  discountValue: number
  applicationType: string
  combinable: boolean
  maxUses: number | null
  maxUsesPerCpf: number | null
  active: boolean
  validFrom: string | null
  validUntil: string | null
  minOrderValue: number | null
}

const props = defineProps<{
  coupon?: CouponData | null
  saving?: boolean
}>()

const emit = defineEmits<{
  save: [payload: any]
}>()

function toLocalInput(dt: string | null | undefined): string {
  if (!dt) return ''
  return dt.substring(0, 16)
}

const form = reactive({
  code: props.coupon?.code || '',
  discountType: props.coupon?.discountType || 'PERCENTAGE',
  discountValue: props.coupon?.discountValue || null as number | null,
  applicationType: props.coupon?.applicationType || 'TOTAL',
  combinable: props.coupon?.combinable ?? false,
  maxUses: props.coupon?.maxUses || (null as number | null),
  maxUsesPerCpf: props.coupon?.maxUsesPerCpf || (null as number | null),
  active: props.coupon?.active ?? true,
  validFrom: toLocalInput(props.coupon?.validFrom),
  validUntil: toLocalInput(props.coupon?.validUntil),
  minOrderValue: props.coupon?.minOrderValue || (null as number | null),
})

const isValid = computed(() => form.code && form.discountValue && form.discountValue > 0)

function save() {
  emit('save', {
    code: form.code,
    discountType: form.discountType,
    discountValue: form.discountValue,
    applicationType: form.applicationType,
    combinable: form.combinable,
    maxUses: form.maxUses || null,
    maxUsesPerCpf: form.maxUsesPerCpf || null,
    active: form.active,
    validFrom: form.validFrom || null,
    validUntil: form.validUntil || null,
    minOrderValue: form.minOrderValue || null,
  })
}
</script>
