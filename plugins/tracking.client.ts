export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const router = useRouter()

  const { persistFbclid } = useFbAttribution()
  persistFbclid()

  try {
    const keys = ['facebook_pixel_id', 'google_analytics_id', 'custom_head_scripts']
    const results = await Promise.allSettled(
      keys.map(key =>
        $fetch<{ key: string; value: string }>(`${config.public.apiBase}/api/config/${key}`)
      )
    )

    const values: Record<string, string> = {}
    results.forEach((r, i) => {
      if (r.status === 'fulfilled' && r.value?.value) {
        values[keys[i]] = r.value.value
      }
    })

    if (values.facebook_pixel_id) {
      const script = document.createElement('script')
      script.innerHTML = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
        (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${values.facebook_pixel_id}');
        fbq('track','PageView');
      `
      document.head.appendChild(script)
    }

    if (values.google_analytics_id) {
      const gtagScript = document.createElement('script')
      gtagScript.async = true
      gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${values.google_analytics_id}`
      document.head.appendChild(gtagScript)

      const inlineScript = document.createElement('script')
      inlineScript.innerHTML = `
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());
        gtag('config','${values.google_analytics_id}',{send_page_view:false});
      `
      document.head.appendChild(inlineScript)
    }

    if (values.custom_head_scripts) {
      const range = document.createRange()
      range.selectNode(document.head)
      const fragment = range.createContextualFragment(values.custom_head_scripts)
      document.head.appendChild(fragment)
    }

    if (values.facebook_pixel_id || values.google_analytics_id) {
      router.afterEach(() => {
        persistFbclid()
        const { pageView } = useTracking()
        pageView()
      })
    }
  } catch {
    // silently ignore
  }
})
