<template>
  <main>
    <div class="width-full container mt-5 mb-10">
      <vue-good-table
        :columns="columns"
        :rows="colaboradores"
        max-height="720px"
        :line-numbers="true"
        :search-options="{
          enabled: true
        }"
      />
    </div>
  </main>
</template>

<script>
import firebase from "firebase";
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";

export default {
  name: "Colaboradores",
  components: {
    VueGoodTable
  },
  data() {
    return {
      colaboradores: [],
      columns: [
        {
          label: "Id",
          field: "id"
        },
        {
          label: "Nombre",
          field: "nombre"
        },
        {
          label: "Estatus",
          field: "estatus"
        },
        {
          label: "Premio",
          field: "premio",
          type: "number"
        }
      ]
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      let colaboradoresRef = await firebase
        .firestore()
        .collection("colaboradores");
      colaboradoresRef.onSnapshot(snap => {
        this.colaboradores = [];
        snap.forEach(doc => {
          let colaborador = doc.data();

          if (colaborador.premio !== "pendiente") {
            colaborador.estatus = "Participó";
          }
          if (colaborador.premio === "pendiente") {
            colaborador.estatus = "Pendiente";
            colaborador.premio = 0;
          }
          colaborador.id = doc.id;
          this.colaboradores.push(colaborador);
        });
      });
    }
  }
};
</script>
