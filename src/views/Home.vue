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
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-green-600">
          {{ regalosConPremioRestantes }}
        </span>
        <p>
          Regalos con premio restantes:
        </p>
      </div>
      <div class="mt-3 flex-auto">
        <span class="font-semibold text-3xl text-red-600">
          {{ regalosSinPremiosRestantes }}
        </span>
        <p>
          Regalos sin premios restantes:
        </p>
      </div>
    </div>
    <!-- /HEADER Details -->

    <div
      class="grid grid-cols-3 gap-5 border-4 border-dashed border-gray-200 rounded-lg h-auto my-10 mx-5"
    >
      <div class="col-span-1 mt-5">
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
              class="mr-5 mt-4 px-10 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
              :class="{
                'bg-green-200 text-green-700': premio.monto !== '$0,00',
                'bg-red-200 text-red-700': premio.monto === '$0,00'
              }"
            >
              <feather
                :type="premio.monto !== '$0,00' ? 'gift' : 'frown'"
              ></feather>
            </div>
          </div>
        </div>
        <!-- /Lista de premios pendientes -->

        <!-- Lista de premios para sortear -->
        <div
          v-if="premiosParaSorteoVisible"
          class="premios-pendientes-container w-full"
        >
          <p class="mt-5 text-xl">
            Sorteando premios...
          </p>

          <div class="width-full mt-3">
            <template v-for="(premio, index) in premiosParaSorteo">
              <transition name="bounce" :key="index">
                <div
                  v-if="premio.visible"
                  class="mr-5 mt-4 px-10 text-xs inline-flex items-center font-bold leading-sm uppercase px-3 py-1 rounded-full"
                  :class="{
                    'bg-green-200 text-green-700': premio.monto !== '$0,00',
                    'bg-red-200 text-red-700': premio.monto === '$0,00'
                  }"
                >
                  <feather
                    :type="premio.monto !== '$0,00' ? 'gift' : 'frown'"
                  ></feather>
                </div>
              </transition>
            </template>
          </div>
        </div>
        <!-- /Lista de premios para sortear -->
      </div>
    </div>
  </main>
</template>

<script>
import { db } from "@/firebase/firebaseConnection";

export default {
  name: "Home",
  data() {
    return {
      colaboradores: [],
      btnSiguienteParticipanteDisabled: false,
      btnSortearActivoDisabled: false,
      premios: [],
      colaboradorActivo: null,
      animacionSiguienteColaborador: { nombre: "" },
      premiosParaSorteo: [],
      BONOS_PREMIADOS: 5,
      BONOS_VACIOS: 2,
      sorteoActivo: false,
      estatus: {
        CON_PREMIO: "conPremio",
        SIN_PREMIO: "sinPremio",
        PENDIENTE: "pendiente",
        ENTREGADO: "entregado"
      },
      listPremiosVisible: true,
      premiosParaSorteoVisible: false,
      duracionSorteo: 3000
    };
  },
  computed: {
    /**
     * Regresa la lista de colaboradores que faltan por recibir premio.
     *
     * @returns {Array<Object>}
     */
    colaboradoresRestantes() {
      return this.colaboradores.filter(
        item => item.premio === this.estatus.PENDIENTE
      );
    },
    /**
     * Calcula los bonos que se darán, descontando los bonos vacíos
     *
     * @returns {number}
     */
    regalosConPremioRestantes() {
      return this.premios.filter(
        item =>
          item.monto !== "$0,00" && item.estatus === this.estatus.PENDIENTE
      ).length;
    },
    /**
     * Calcula los bonos vacíos que quedan por repartir.
     *
     * @returns {number}
     */
    regalosSinPremiosRestantes() {
      return this.premios.filter(
        item =>
          item.monto === "$0,00" && item.estatus === this.estatus.PENDIENTE
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

      for (let i = 0; i < this.premios.length; i++) {
        if (this.premios[i].estatus === this.estatus.PENDIENTE) {
          premiosPendientes.push({
            id: this.premios[i].id,
            premio: this.estatus.PENDIENTE,
            monto: this.premios[i].monto
          });
        }
      }
      return premiosPendientes.sort(() => Math.random() - 0.5);
    }
  },
  methods: {
    /**
     * Método que permie obtener al siguiente participante.
     */
    async obtenerSiguienteParticipanteClick() {
      this.colaboradorActivo = null;
      let duracionAnimacion = 10;
      let randomValue = Math.random() * (50 - 25) + 25;

      for (let i = 1; i < randomValue; i++) {
        await new Promise(r => setTimeout(r, duracionAnimacion));
        this.animacionSiguienteColaborador = this.colaboradores[i];
      }
      this.colaboradorActivo = this.animacionSiguienteColaborador;
      this.animacionSiguienteColaborador = { nombre: "" };
      this.btnSiguienteParticipanteDisabled = true;
    },
    /**
     * Función que inicia la interacción para el sorteo de bono para el siguiente colaborador.
     */
    async sortearPremio() {
      // Precarga la lista de bonos para el sorteo con los bonos pendientes
      this.premiosParaSorteo = await this.listaDePremiosPendientes.map(item => {
        item.visible = true;
        return item;
      });
      // Oculta la lista de bonosPendientes, para mostrar la lista premiosParaSorteo
      this.listPremiosVisible = false;

      // Muestra la lista premiosParaSorteo
      this.premiosParaSorteoVisible = true;
      let duracion = this.duracionSorteo / this.listaDePremiosPendientes.length;

      let arrayPosiciones = [];

      for (let i = 0; i < this.premiosParaSorteo.length; i++) {
        arrayPosiciones.push(i);
      }

      // Reordena las posiciones
      arrayPosiciones = this.shuffle(arrayPosiciones);

      // Inicia a ocultar bonos, con contador en 1, para dejar 1 sólo premio
      for (let i = 1; i < this.premiosParaSorteo.length; i++) {
        await new Promise(r => setTimeout(r, duracion));
        this.premiosParaSorteo[arrayPosiciones[i]].visible = false;
      }
      await new Promise(r => setTimeout(r, 1000));

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
      db.collection("premios")
        .doc(resultadoSorteo.id)
        .set(premio)
        .then(() => {});
      db.collection("colaboradores")
        .doc(this.colaboradorActivo.id)
        .set(colaborador)
        .then(() => {});
    },
    /**
     * Permite obtener el resultado del sorteo.
     */
    getResultadoSorteo() {
      let resultado = this.premiosParaSorteo.filter(
        item => item.visible === true
      )[0];
      console.log(resultado);
      if (resultado.monto !== "$0,00") {
        this.$swal({
          title: "¡Felicidades!",
          text: `¡ganaste ${resultado.monto}!`,
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
    },
    /**
     * Método que recibe un array de elementos y los retorna en orden aleatorio.
     *
     * @param array Array de elementos a barajar
     * @returns {Array<number>}
     */
    shuffle(array) {
      let currentIndex = array.length,
        temporaryValue,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    }
  },

  firestore: {
    colaboradores: db.collection("colaboradores"),
    premios: db.collection("premios")
  }
};
</script>
