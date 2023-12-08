<template>
  <main>
    <div class="container mt-5 mb-10">
      <div class="width-full">
        <load-data />
      </div>
      <vue-good-table
        :columns="columns"
        :rows="colaboradores"
        max-height="55vh"
        :line-numbers="true"
        :search-options="{
          enabled: true
        }"
      >
        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field === 'estatus'">
            <span
              class="font-semibold"
              :class="
                props.row.estatus === 'Pendiente'
                  ? 'text-blue-500'
                  : 'text-green-600 '
              "
            >
              {{ props.row.estatus }}
            </span>
          </span>
          <span v-else-if="props.column.field === 'premio'">
            <span
              class="font-semibold"
              :class="
                props.row.premio !== 0 ? 'text-green-500' : 'text-red-600 '
              "
            >
              {{ props.formattedRow[props.column.field] | format_price }}
            </span>
          </span>
          <span v-else>
            {{ props.formattedRow[props.column.field] }}
          </span>
        </template>
      </vue-good-table>
    </div>
  </main>
</template>

<script>
import firebase from "firebase";
import "vue-good-table/dist/vue-good-table.css";
import { VueGoodTable } from "vue-good-table";
import LoadData from "./LoadData.vue";

export default {
  name: "Colaboradores",
  components: {
    VueGoodTable,
    LoadData
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
