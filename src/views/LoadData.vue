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
          @click="loadDataToFirestore"
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
import jsonData from "../data/data.json";
import firebase from "firebase";

export default {
  name: "Login",
  data() {
    return {
      colaboradores: [],
      premios: []
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      let premiosRef = await firebase.firestore().collection("premios");
      let colaboradoresRef = await firebase
        .firestore()
        .collection("colaboradores");

      premiosRef.onSnapshot(snap => {
        this.premios = [];
        snap.forEach(doc => {
          let premio = doc.data();
          premio.id = doc.id;
          this.premios.push(premio);
        });
      });

      colaboradoresRef.onSnapshot(snap => {
        this.colaboradores = [];
        snap.forEach(doc => {
          let colaborador = doc.data();
          colaborador.id = doc.id;
          this.colaboradores.push(colaborador);
        });
      });
    },
    /**
     * Permite precargar la BDD con los valores iniciales.
     */
    loadDataToFirestore() {
      // Valida si existen valores en la BDD
      if (this.colaboradores.length > 1) {
        alert("Datos ya han sido cargados");
        return;
      }
      let colaboradores = jsonData["colaboradores"];
      let premios = jsonData["premios"];

      // Genera los premios de $ 0
      while (premios.length < colaboradores.length) {
        let premioVacio = {
          estatus: "pendiente",
          monto: 0,
          premioFinal: false
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
        firebase
          .firestore()
          .collection("colaboradores")
          .doc(item.id)
          .delete();
      });
      this.premios.forEach(item => {
        firebase
          .firestore()
          .collection("premios")
          .doc(item.id)
          .delete();
      });
    },
    cargarColaborador(colaborador) {
      firebase
        .firestore()
        .collection("colaboradores")
        .add(colaborador);
    },
    cargarPremio(premio) {
      firebase
        .firestore()
        .collection("premios")
        .add(premio);
    },
    limpiarDatos() {
      this.colaboradores.forEach(item => {
        if (!item.codigo) {
          firebase
            .firestore()
            .collection("colaboradores")
            .doc(item.id)
            .delete();
        }
      });
      this.premios.forEach(item => {
        if (!item.monto) {
          firebase
            .firestore()
            .collection("premios")
            .doc(item.id)
            .delete();
        }
      });
    }
  }
};
</script>
