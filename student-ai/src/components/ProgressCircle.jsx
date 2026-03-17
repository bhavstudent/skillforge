import { motion } from "framer-motion";

export default function ProgressCircle({ percent }) {
    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ 
                background: "#1e1e1e",
                borderRadius: "16px",
                padding: "30px",
                textAlign: "center",
                color: "white"
             }}
             >
                <h2>{percent}%</h2>
                <p>Progress</p>
             </motion.div>
    );
}