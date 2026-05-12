<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-12">
    <h1 class="font-serif text-3xl text-teal mb-10 text-center">Perguntas Frequentes</h1>

    <div class="space-y-3">
      <div
        v-for="(item, i) in faqs"
        :key="i"
        class="border border-sand-200 rounded-xl overflow-hidden"
      >
        <button
          @click="toggle(i)"
          class="w-full flex items-center justify-between gap-4 px-5 py-4 text-left bg-white hover:bg-sand-50 transition-colors"
        >
          <span class="font-medium text-primary-800 text-sm sm:text-base">{{ item.question }}</span>
          <i
            class="pi pi-chevron-down text-teal text-xs flex-shrink-0 transition-transform duration-200"
            :class="{ 'rotate-180': open === i }"
          />
        </button>
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="opacity-0 max-h-0"
          enter-to-class="opacity-100 max-h-96"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="opacity-100 max-h-96"
          leave-to-class="opacity-0 max-h-0"
        >
          <div v-if="open === i" class="px-5 pb-5 bg-white border-t border-sand-100">
            <div class="pt-3 text-sm text-primary-600 leading-relaxed space-y-2" v-html="item.answer" />
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const open = ref<number | null>(0)

function toggle(i: number) {
  open.value = open.value === i ? null : i
}

const faqs = [
  {
    question: 'Como acesso os materiais e por quanto tempo ficam disponíveis?',
    answer: `
      <p>Os materiais são digitais e vêm em formato PDF.</p>
      <p>Assim que o pagamento for aprovado, você poderá fazer o download diretamente na sua conta ou pelo link que será enviado por e-mail. Também enviaremos o material via WhatsApp.</p>
      <p>Você terá <strong>365 dias</strong> para acessar e baixar os arquivos pela loja.<br>
      Nossa dica: salve os materiais no seu computador ou nuvem para usar sempre que quiser.</p>
      <p class="bg-sand-100 rounded-lg px-4 py-3 text-xs text-steel mt-3">
        <strong>Importante:</strong> Este é um produto digital. Não é enviado pelos Correios.
      </p>
    `,
  },
  {
    question: 'Quais são as formas de pagamento?',
    answer: `<p>O pagamento pode ser feito no <strong>cartão de crédito</strong> ou <strong>Pix</strong>.</p>`,
  },
  {
    question: 'Posso cancelar?',
    answer: `<p>Nos primeiros <strong>7 (sete) dias</strong> após a compra, você poderá cancelar e receber o dinheiro de volta.</p>`,
  },
]
</script>
