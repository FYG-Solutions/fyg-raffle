<template>
  <main>
    <!-- HEADER Details -->
    <div class="mt-5 details-container flex w-full">
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-blue-700">
          {{ colaboradoresRestantes.length }}
        </span>
        <p>
          Colaboradores restantes:
        </p>
      </div>
    </div>
    <!-- /HEADER Details -->

    <div
      class="grid grid-cols-3 gap-5 border-4 border-dashed border-gray-200 rounded-lg h-auto my-10 mx-5"
    >
      <div class="col-span-1 mt-5 h-72">
        <div class="width-full">
          <button
            :disabled="btnSiguienteParticipanteDisabled"
            class="rounded border border-blue-500 bg-blue-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-blue-600 focus:outline-none focus:shadow-outline"
            :class="{ 'cursor-not-allowed': btnSiguienteParticipanteDisabled }"
            @click="obtenerSiguienteParticipanteClick"
          >
            Elegir siguiente participante
          </button>
        </div>
        <p class="text-gray-800 mt-5 mb-3">
          Participante actual:
        </p>
        <p class="text-3xl text-blue-700">
          <span v-if="colaboradorActivo">
            {{ colaboradorActivo.nombre }}
          </span>
          <span v-else>
            {{ animacionSiguienteColaborador.nombre }}
          </span>
        </p>
      </div>
      <div class="col-span-2 mt-5">
        <div class="width-full">
          <button
            v-if="colaboradorActivo"
            :disabled="btnSortearActivoDisabled"
            class="rounded border border-green-500 bg-green-500 text-white rounded-md px-4 py-2 m-2 transition duration-500 ease select-none hover:bg-green-600 focus:outline-none focus:shadow-outline"
            :class="{ 'cursor-not-allowed': btnSortearActivoDisabled }"
            @click="sortearPremio"
          >
            Sortear premio para {{ colaboradorActivo.nombre }}
          </button>
        </div>

        <!-- Lista de premios pendientes -->
        <div
          v-if="listPremiosVisible"
          class="premios-pendientes-container w-full"
        >
          <p class="mt-5">
            Premios pendientes:
          </p>
          <div class="width-full mt-3">
            <div
              v-for="(premio, index) in listaDePremiosPendientes"
              :key="index"
              class="bg-blue-200 text-blue-700 mr-5 mt-4 px-10 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
            >
              <feather type="gift"></feather>
              <span class="ml-1">
                <!-- ? -->
              </span>
            </div>
          </div>
        </div>
        <!-- /Lista de premios pendientes -->

        <!-- Lista de premios para sortear -->
        <div
          v-if="premiosParaSorteoVisible"
          class="premios-pendientes-container w-full"
        >
          <p v-if="estaSorteando" class="mt-5 text-xl">
            Sorteando premios...
          </p>

          <div class="width-full mt-3">
            <template v-for="(premio, index) in premiosParaSorteo">
              <transition name="bounce" :key="index">
                <div
                  class="mr-5 mt-4 px-10 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
                  :class="{
                    'bg-green-200 text-green-700':
                      premio.monto !== 0 && premio !== estaSorteando,
                    'bg-red-200 text-red-700':
                      premio.monto === 0 && premio !== estaSorteando,
                    'bg-blue-200 text-blue-700': estaSorteando
                  }"
                >
                  <feather type="gift"></feather>
                  <span class="ml-1" v-if="estaSorteando">
                    <!-- ??? -->
                  </span>
                  <span class="ml-1" v-else>
                    {{ premio.monto | format_price }}
                  </span>
                </div>
              </transition>
            </template>
          </div>
        </div>
        <!-- /Lista de premios para sortear -->
      </div>
      <div class="flex justify-end col-span-3">
        <div class="mx-10 my-5 flex items-baseline space-x-4">
          <a
            href="#"
            class="px-3 py-2 rounded-md text-sm font-medium text-gray-800 hover:text-gray-700 flex items-center"
            @click="reload"
          >
            <span class="font-semibold">Siguiente premio</span>
            <feather type="play"></feather>
          </a>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import firebase from "firebase";

export default {
  name: "Home",
  data() {
    return {
      colaboradores: [],
      premios: [],
      btnSiguienteParticipanteDisabled: false,
      btnSortearActivoDisabled: false,
      colaboradorActivo: null,
      animacionSiguienteColaborador: { nombre: "" },
      siguienteColaborador: { nombre: "" },
      premiosParaSorteo: [],
      sorteoActivo: false,
      estatus: {
        CON_PREMIO: "conPremio",
        SIN_PREMIO: "sinPremio",
        PENDIENTE: "pendiente",
        ENTREGADO: "entregado"
      },
      listPremiosVisible: true,
      premiosParaSorteoVisible: false,
      duracionSorteo: 700,
      duracionSiguienteColaborador: 10,
      estaSorteando: true
    };
  },
  created() {
    this.loadData();
  },
  watch: {
    colaboradoresRestantes(val) {
      if (val.length === 0) {
        this.btnSiguienteParticipanteDisabled = true;
      }
    }
  },
  computed: {
    /**
     * Regresa la lista de colaboradores que faltan por recibir premio.
     *
     * @returns {Array<Object>}
     */
    colaboradoresRestantes() {
      return this.colaboradores.filter(
        colaborador => colaborador.premio === this.estatus.PENDIENTE
      );
    },
    /**
     * Calcula los bonos que se darán, descontando los bonos vacíos
     *
     * @returns {number}
     */
    regalosConPremioRestantes() {
      return this.premios.filter(
        item => item.monto !== 0 && item.estatus === this.estatus.PENDIENTE
      ).length;
    },
    /**
     * Calcula los bonos vacíos que quedan por repartir.
     *
     * @returns {number}
     */
    regalosSinPremiosRestantes() {
      return this.premios.filter(
        item => item.monto === 0 && item.estatus === this.estatus.PENDIENTE
      ).length;
    },
    /**
     * Función que retorna un arreglo con los bonos premiados y vacíos por otorgar.
     *
     * @returns {Array<Object>}
     */
    listaDePremiosPendientes() {
      // Filtra los premios pendientes
      let premiosPendientes = [];
      let premiosGanadores = [];
      let premiosPerdedores = [];

      for (let i = 0; i < this.premios.length; i++) {
        if (this.premios[i].estatus === this.estatus.PENDIENTE) {
          // Valida si es premio ganador o perdedor
          const premio = {
            id: this.premios[i].id,
            premio: this.estatus.PENDIENTE,
            monto: this.premios[i].monto,
            premioFinal: this.premios[i].premioFinal
          };
          if (this.premios[i].monto !== 0) {
            premiosGanadores.push(premio);
          } else {
            premiosPerdedores.push(premio);
          }
        }
      }
      // Ordena los premios ganadores
      premiosPendientes = premiosGanadores.filter(item => item.monto !== 0);
      // .sort((a, b) => b.monto - a.monto);

      // Agrega los premios ganadores al arreglo de premios perdedores
      while (premiosPerdedores.length > 0) {
        let premioPerdedor = premiosPerdedores.pop();

        let min = 1;
        let max = premiosPendientes.length;
        let rand = Math.random() * (max - min) + min;
        premiosPendientes.splice(rand + 1, 0, premioPerdedor);
      }

      // Ejecuta bloqueo de seguridad en caso de que sólo quede 1 premio
      return premiosPendientes;
    }
  },
  methods: {
    reload() {
      this.$parent.reload();
    },
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
     * Método que permie obtener al siguiente participante.
     */
    async obtenerSiguienteParticipanteClick() {
      this.colaboradorActivo = null;
      let duracionAnimacion = parseInt(
        700 / this.colaboradoresRestantes.length,
        10
      );
      let colaboradoresFiltrados = [];
      let colaboradoresAnimacion = [...this.colaboradoresRestantes];
      // Rellena con los colaboradores nuevos, si es que existen.
      // eslint-disable-next-line
      const colaboradoresNuevos = this.colaboradoresRestantes.filter(
        i => i["colaboradorAntiguo"] === false
      );
      if (colaboradoresNuevos.length > 0) {
        if (colaboradoresNuevos.length < 3) {
          colaboradoresFiltrados = [...colaboradoresNuevos];
        } else {
          colaboradoresFiltrados = [
            ...colaboradoresNuevos,
            this.colaboradoresRestantes[0],
            this.colaboradoresRestantes[1],
            this.colaboradoresRestantes[2]
          ];
        }
      } else {
        colaboradoresFiltrados = [...this.colaboradoresRestantes];
      }

      // Animación para colaboradores
      for (let i = this.colaboradoresRestantes.length - 1; i >= 0; i--) {
        await new Promise(r => setTimeout(r, duracionAnimacion));
        if (colaboradoresAnimacion.length > 0) {
          this.animacionSiguienteColaborador = colaboradoresAnimacion.splice(
            Math.floor(Math.random() * colaboradoresAnimacion.length),
            1
          )[0];
        }
      }
      // Elección del colaborador
      for (let i = colaboradoresFiltrados.length - 1; i >= 0; i--) {
        this.siguienteColaborador = colaboradoresFiltrados.splice(
          Math.floor(Math.random() * colaboradoresFiltrados.length),
          1
        )[0];
      }
      this.colaboradorActivo = this.siguienteColaborador;
      this.siguienteColaborador = { nombre: "" };
      this.btnSiguienteParticipanteDisabled = true;
      if (this.colaboradoresRestantes.length === 1) {
        this.sortearPremio();
      }
    },
    /**
     * Función que inicia la interacción para el sorteo de bono para el siguiente colaborador.
     */
    async sortearPremio() {
      // Precarga la lista de bonos para el sorteo con los bonos pendientes
      this.premiosParaSorteo = [
        ...this.listaDePremiosPendientes.map(item => {
          return { ...item, visible: true };
        })
      ];
      // Oculta la lista de bonosPendientes, para mostrar la lista premiosParaSorteo
      this.listPremiosVisible = false;

      // Muestra la lista premiosParaSorteo
      this.premiosParaSorteoVisible = true;
      let duracion = this.duracionSorteo / this.listaDePremiosPendientes.length;
      while (this.premiosParaSorteo.length > 1) {
        let item = this.premiosParaSorteo.filter(i => i.visible === true)[
          Math.floor(
            Math.random() *
              this.premiosParaSorteo.filter(i => i.visible === true).length
          )
        ];

        // Si quedan dos regalos, y aun existe el regalo final, lo elimina directamente
        if (this.premiosParaSorteo.length === 2) {
          const removeIndex = this.premiosParaSorteo.findIndex(
            k => k.premioFinal === true
          );
          if (removeIndex !== -1) {
            // remove object
            this.premiosParaSorteo.splice(removeIndex, 1);
            continue;
          }
        }
        // get index of object with id of 37
        const removeIndex = this.premiosParaSorteo.findIndex(
          j => j.id === item.id
        );
        // remove object
        this.premiosParaSorteo.splice(removeIndex, 1);
        await new Promise(r => setTimeout(r, duracion));
      }
      await new Promise(r => setTimeout(r, 800));

      let resultadoSorteo = this.getResultadoSorteo();
      this.guardarResultado(resultadoSorteo);
      this.btnSortearActivoDisabled = true;
    },
    /**
     * Función para almacenar en Firestore el resultado del sorteo.
     */
    guardarResultado(resultadoSorteo) {
      let premio = {
        monto: resultadoSorteo.monto,
        estatus: this.estatus.ENTREGADO
      };
      let colaborador = { ...this.colaboradorActivo };
      colaborador.premio = resultadoSorteo.monto;
      firebase
        .firestore()
        .collection("premios")
        .doc(resultadoSorteo.id)
        .set(premio)
        .then(() => {});
      firebase
        .firestore()
        .collection("colaboradores")
        .doc(this.colaboradorActivo.id)
        .set(colaborador)
        .then(() => {});
    },
    /**
     * Permite obtener el resultado del sorteo.
     */
    formatCurrency(value) {
      if (isNaN(value)) {
        return value;
      }
      let val = (value / 1).toFixed(2);
      val = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return `$ ${val}`;
    },
    getResultadoSorteo() {
      this.estaSorteando = false;
      let resultado = this.premiosParaSorteo[0];
      let formatValue = this.formatCurrency(resultado.monto);
      if (resultado.monto !== 0) {
        this.$swal({
          title: "¡Felicidades!",
          text: `¡ganaste ${formatValue}!`,

          icon: "success"
        });
      } else {
        this.$swal({
          title: "Ops...",
          text: `Más suerte la próxima!`,

          icon: "error"
        });
      }
      return resultado;
    }
  }
};
</script>
