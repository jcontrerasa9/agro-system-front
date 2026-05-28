import React, { useEffect, useState } from 'react'

export default function Crops() {
  const API_BASE = 'http://localhost:8000/api/crops'
  const PAGE_SIZE = 10
  const [datos, setDatos] = useState([])
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({
    type: '',
    variety: '',
    description: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)

  function normalize_response(response) {
    return response.text().then(function (text) {
      if (!text) {
        return { status: response.status, ok: response.ok, data: null }
      }

      try {
        return {
          status: response.status,
          ok: response.ok,
          data: JSON.parse(text),
        }
      } catch (error) {
        return { status: response.status, ok: response.ok, data: null }
      }
    })
  }

  function get_api() {
    setLoading(true)
    fetch(API_BASE)
      .then(function (response) {
        return normalize_response(response)
      })
      .then(function (result) {
        setLoading(false)
        if (!result.ok) {
          if (result.status === 404) {
            alert('No se encontraron cultivos')
            return
          }
          alert('No se pudo cargar la lista de cultivos')
          return
        }

        const list = Array.isArray(result.data) ? result.data : []
        setDatos(list)
        setPage(1)
      })
      .catch(function () {
        setLoading(false)
        alert('Error de red al cargar cultivos')
      })
  }

  function get_detail(id) {
    if (!id) {
      return
    }

    setDetailLoading(true)
    fetch(API_BASE + '/' + id)
      .then(function (response) {
        return normalize_response(response)
      })
      .then(function (result) {
        setDetailLoading(false)
        if (!result.ok) {
          if (result.status === 404) {
            alert('Cultivo no encontrado')
          } else {
            alert('No se pudo cargar el detalle')
          }
          setSelected(null)
          return
        }

        setSelected(result.data)
      })
      .catch(function () {
        setDetailLoading(false)
        alert('Error de red al cargar detalle')
      })
  }

  function handle_change(event) {
    const name = event.target.name
    const value = event.target.value
    setForm(function (prev) {
      return { ...prev, [name]: value }
    })
  }

  function reset_form() {
    setForm({ type: '', variety: '', description: '' })
    setEditingId(null)
  }

  function start_edit(dato) {
    setEditingId(dato.id)
    setForm({
      type: dato.type || '',
      variety: dato.variety || '',
      description: dato.description || '',
    })
  }

  function submit_form(event) {
    event.preventDefault()

    if (!form.type || !form.variety || !form.description) {
      alert('Completa todos los campos')
      return
    }

    if (editingId) {
      update_crop(editingId)
      return
    }

    create_crop()
  }

  function create_crop() {
    fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(function (response) {
        return normalize_response(response)
      })
      .then(function (result) {
        if (!result.ok) {
          alert('No se pudo crear el cultivo')
          return
        }

        alert('Cultivo creado')
        reset_form()
        get_api()
      })
      .catch(function () {
        alert('Error de red al crear cultivo')
      })
  }

  function update_crop(id) {
    fetch(API_BASE + '/' + id, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    })
      .then(function (response) {
        return normalize_response(response)
      })
      .then(function (result) {
        if (!result.ok) {
          if (result.status === 404) {
            alert('Cultivo no encontrado')
            return
          }
          alert('No se pudo actualizar el cultivo')
          return
        }

        alert('Cultivo actualizado')
        reset_form()
        get_api()
        if (selected && selected.id === id) {
          get_detail(id)
        }
      })
      .catch(function () {
        alert('Error de red al actualizar cultivo')
      })
  }

  function eliminar(id) {
    fetch(API_BASE + '/' + id, {
      method: 'DELETE',
    })
      .then(function (response) {
        if (response.status === 409) {
          alert('No se puede eliminar: hay siembras asociadas')
          return null
        }
        return normalize_response(response)
      })
      .then(function (result) {
        if (!result) {
          return
        }
        if (!result.ok) {
          if (result.status === 404) {
            alert('Cultivo no encontrado')
            return
          }
          alert('No se pudo eliminar el cultivo')
          return
        }

        alert('Cultivo eliminado')
        if (selected && selected.id === id) {
          setSelected(null)
        }
        get_api()
      })
      .catch(function () {
        alert('Error de red al eliminar cultivo')
      })
  }

  useEffect(function () {
    get_api()
  }, [])

  const totalPages = Math.max(1, Math.ceil(datos.length / PAGE_SIZE))
  const pageSafe = Math.min(page, totalPages)
  const startIndex = (pageSafe - 1) * PAGE_SIZE
  const pageData = datos.slice(startIndex, startIndex + PAGE_SIZE)

  function go_page(nextPage) {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages)
    setPage(safePage)
  }

  return (
    <div className="crops">
      <div className="crops-layout">
        <div className="panel">
          <div className="panel-header">
            <h2>Cultivos</h2>
            <button type="button" onClick={get_api} disabled={loading}>
              {loading ? 'Cargando...' : 'Recargar'}
            </button>
          </div>
          <div className="table-wrap">
            <table className="crop-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Variedad</th>
                  <th>Descripcion</th>
                  <th>Opciones</th>
                </tr>
              </thead>
              <tbody>
                {datos.length === 0 ? (
                  <tr>
                    <td colSpan="5">Sin cultivos registrados</td>
                  </tr>
                ) : (
                  pageData.map(function (dato) {
                    return (
                      <tr key={dato.id}>
                        <td>{dato.id}</td>
                        <td>{dato.type}</td>
                        <td>{dato.variety}</td>
                        <td>{dato.description}</td>
                        <td className="actions">
                          <button
                            type="button"
                            onClick={function () {
                              get_detail(dato.id)
                            }}
                          >
                            Ver
                          </button>
                          <button
                            type="button"
                            onClick={function () {
                              start_edit(dato)
                            }}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={function () {
                              eliminar(dato.id)
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <p>
              Mostrando {pageData.length} de {datos.length} registros
            </p>
            <div className="page-controls">
              <button
                type="button"
                onClick={function () {
                  go_page(pageSafe - 1)
                }}
                disabled={pageSafe === 1}
              >
                Anterior
              </button>
              <span>
                Pagina {pageSafe} de {totalPages}
              </span>
              <button
                type="button"
                onClick={function () {
                  go_page(pageSafe + 1)
                }}
                disabled={pageSafe === totalPages}
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        <div className="panel">
          <h2>{editingId ? 'Editar cultivo' : 'Nuevo cultivo'}</h2>
          <form className="crop-form" onSubmit={submit_form}>
            <label>
              Tipo
              <input
                name="type"
                value={form.type}
                onChange={handle_change}
                placeholder="Ej: Maiz"
              />
            </label>
            <label>
              Variedad
              <input
                name="variety"
                value={form.variety}
                onChange={handle_change}
                placeholder="Ej: Amarillo"
              />
            </label>
            <label>
              Descripcion
              <textarea
                name="description"
                value={form.description}
                onChange={handle_change}
                rows="4"
                placeholder="Descripcion del cultivo"
              />
            </label>
            <div className="form-actions">
              <button type="submit">
                {editingId ? 'Guardar cambios' : 'Crear cultivo'}
              </button>
              {editingId ? (
                <button type="button" onClick={reset_form}>
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="panel">
          <h2>Detalle</h2>
          {detailLoading ? (
            <p>Cargando detalle...</p>
          ) : selected ? (
            <div className="detail">
              <p>
                <strong>ID:</strong> {selected.id}
              </p>
              <p>
                <strong>Tipo:</strong> {selected.type}
              </p>
              <p>
                <strong>Variedad:</strong> {selected.variety}
              </p>
              <p>
                <strong>Descripcion:</strong> {selected.description}
              </p>
            </div>
          ) : (
            <p>Selecciona un cultivo para ver el detalle.</p>
          )}
        </div>
      </div>
    </div>
  )
}
