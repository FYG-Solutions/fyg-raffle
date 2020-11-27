<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Recarga de datos
        </h2>
      </div>

      <div>
        <button
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          @click="loadData"
        >
          Cargar datos
        </button>
        <button
          type="submit"
          class="group mt-3 relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          @click="eliminarDatos"
        >
          Eliminar datos
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { db } from "@/firebase/firebaseConnection";
import jsonData from "../data/data.json";

export default {
  name: "Login",
  data() {
    return {
      colaboradores: [],
      premios: []
    };
  },
  methods: {
    /**
     * Permite precargar la BDD con los valores iniciales.
     */
    loadData() {
      // Valida si existen valores en la BDD
      if (this.colaboradores.length > 1) {
        alert("Datos ya han sido cargados");
        return;
      }
      let colaboradores = jsonData["colaboradores"];
      let premios = jsonData["premios"];

      // Genera los premios de $0,00
      while (premios.length < colaboradores.length) {
        let premioVacio = {
          id: premios.length + 1,
          estatus: "pendiente",
          monto: "$0,00"
        };
        premios.push(premioVacio);
      }

      colaboradores.forEach(item => {
        this.cargarColaborador(item);
      });

      premios.forEach(item => {
        this.cargarPremio(item);
      });

      // Elimina los documentos iniciales
      this.limpiarDatos();
    },
    eliminarDatos: function() {
      this.colaboradores.forEach(item => {
        db.collection("colaboradores")
          .doc(item.id)
          .delete();
      });
      this.premios.forEach(item => {
        db.collection("premios")
          .doc(item.id)
          .delete();
      });
    },
    cargarColaborador(colaborador) {
      const createdAt = new Date();
      colaborador.createdAt = createdAt;
      db.collection("colaboradores").add(colaborador);
    },
    cargarPremio(premio) {
      const createdAt = new Date();
      premio.createdAt = createdAt;
      db.collection("premios").add(premio);
    },
    limpiarDatos() {
      this.colaboradores.forEach(item => {
        if (!item.codigo) {
          db.collection("colaboradores")
            .doc(item.id)
            .delete();
        }
      });
      this.premios.forEach(item => {
        if (!item.monto) {
          db.collection("premios")
            .doc(item.id)
            .delete();
        }
      });
    }
  },
  firestore: {
    colaboradores: db.collection("colaboradores"),
    premios: db.collection("premios")
  }
};
</script>
