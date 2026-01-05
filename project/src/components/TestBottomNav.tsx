export default function TestBottomNav() {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        background: 'red',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '20px',
        fontWeight: 'bold'
      }}
    >
      TEST BOTTOM NAV - SI TU VOIS ÇA ÇA MARCHE
    </div>
  );
}
