interface CaptchaSectionProps {
  captcha: string;
  onChange: (value: string) => void;
  imageUrl: string;
  onRefresh: () => void;
}

export default function CaptchaSection({ captcha, onChange, imageUrl, onRefresh }: CaptchaSectionProps) {
  return (
    <div
      className="form-group text-center"
      style={{
        backgroundColor: '#EEEEEE',
        borderRadius: '10px',
        border: '1px solid #B3B3B3',
        boxShadow: 'rgba(0, 0, 0, 0.24) 0px 3px 8px',
        padding: '10px'
      }}
    >
      <label style={{ padding: '10px', display: 'block' }}>
        Por favor valide el Captcha
      </label>
      <img 
        src={imageUrl} 
        alt="CAPTCHA" 
        style={{ marginBottom: '10px' }}
      />
      <br />
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control text-center font-weight-bold"
          value={captcha}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          required
          maxLength={6}
          style={{ backgroundColor: '#FFFFFF' }}
        />
        <div className="input-group-append">
          <i
            className="refresh-captcha input-group-text fa fa-random cursor-pointer"
            onClick={onRefresh}
            title="Recargar Captcha"
          />
        </div>
      </div>
    </div>
  );
}