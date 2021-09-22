<<template>
    <div>
        <h2> Config Page </h2>
    </div>
</template>

<script>
import useWebSocket from '../composables/useWebSocket'

export default {
    name: "Config",
    setup() {
        
        const { data, send } = useWebSocket;

        return { data };
    }
}

</script>