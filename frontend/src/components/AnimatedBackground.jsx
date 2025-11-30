import { motion } from 'framer-motion';

const AnimatedBackground = ({ variant = 'default' }) => {
  const variants = {
    login: {
      gradient: 'from-blue-600 via-purple-600 to-pink-600',
      shapes: [
        { color: 'rgba(255, 255, 255, 0.1)', size: 200, x: '10%', y: '20%' },
        { color: 'rgba(255, 255, 255, 0.08)', size: 300, x: '80%', y: '60%' },
        { color: 'rgba(255, 255, 255, 0.1)', size: 150, x: '50%', y: '80%' },
      ]
    },
    register: {
      gradient: 'from-green-500 via-teal-500 to-cyan-500',
      shapes: [
        { color: 'rgba(255, 255, 255, 0.1)', size: 250, x: '15%', y: '30%' },
        { color: 'rgba(255, 255, 255, 0.08)', size: 180, x: '70%', y: '50%' },
        { color: 'rgba(255, 255, 255, 0.1)', size: 220, x: '40%', y: '75%' },
      ]
    },
    default: {
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      shapes: [
        { color: 'rgba(255, 255, 255, 0.1)', size: 200, x: '10%', y: '20%' },
        { color: 'rgba(255, 255, 255, 0.08)', size: 300, x: '80%', y: '60%' },
        { color: 'rgba(255, 255, 255, 0.1)', size: 150, x: '50%', y: '80%' },
      ]
    }
  };

  const config = variants[variant] || variants.default;

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Animated Gradient Background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'reverse',
        }}
        style={{
          backgroundSize: '200% 200%',
        }}
      />

      {/* Animated Blob Shapes */}
      {config.shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full blur-3xl"
          style={{
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            left: shape.x,
            top: shape.y,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10 + index * 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Animated Grid Pattern */}
      <motion.div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
        animate={{
          backgroundPosition: ['0% 0%', '50px 50px'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />

      {/* Animated Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white rounded-full opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default AnimatedBackground;

