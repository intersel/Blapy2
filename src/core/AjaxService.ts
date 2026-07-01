import { Logger } from './Logger'
import { AjaxOptions } from '#shared/types'
import JSON5 from 'json5'

export class AjaxService {

  constructor(private readonly logger: Logger) {
  }

  async request<T>(url: string, options: AjaxOptions = {}): Promise<T> {

    if (!url) {
      throw new Error('URL is required')
    }

    const {
      method = 'GET',
      body = null,
      headers = {},
      params = null,
      timeout = 30000,
      ...fetchOptions
    } = options

    let finalUrl = url

    if (method.toUpperCase() === 'GET' && params) {
      const urlParams = new URLSearchParams(params)
      finalUrl += (url.includes('?') ? '&' : '?') + urlParams.toString()
    }

    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeout)

    try {

      let processedBody: BodyInit | null = null

      if (method.toUpperCase() !== 'GET' && body) {
        if (body instanceof FormData || typeof body === 'string') {
          processedBody = body
        } else if (typeof body === 'object') {
          const params = new URLSearchParams()
          Object.entries(body).forEach(([k, v]) => {
            if (v != null) params.append(k, String(v))
          })
          processedBody = params
        }
      }

      const request = new Request(finalUrl, {
        ...fetchOptions,
        method,
        body: processedBody,
        signal: controller.signal,
      })

      request.headers.set('X-Requested-With', 'XMLHttpRequest')

      Object.entries(headers).forEach(([k, v]) => {
        request.headers.set(k, v)
      })

      const response = await fetch(request)
      clearTimeout(id)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type')

      if (contentType?.includes('application/json')) {
        const json = await response.json()
        this.logger?.info(`AJAX Success (JSON): ${method} ${finalUrl}`, "AjaxService")
        return json
      }

      const text = await response.text()
      this.logger?.info(`AJAX Success (Text): ${method} ${finalUrl}`, JSON5.stringify({ status: response.status, responseLength: text.length }))
      return text as T

    } catch (err) {
      clearTimeout(id)

      if (err instanceof Error && err.name === 'AbortError') {
        this.logger?.error(`AJAX Timeout: ${method} ${finalUrl}`)
        throw new Error(`Request timeout after ${timeout}ms`)
      }

      this.logger?.error(`AJAX Error: ${method} ${finalUrl}`)
      throw err
    }
  }

  async get<T>(url: string, options: AjaxOptions = {}) {
    return this.request<T>(url, {
      ...options,
      method: "GET"
    })
  }

  async post<T>(url: string, data: BodyInit, options: AjaxOptions = {}) {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: data
    })
  }
}