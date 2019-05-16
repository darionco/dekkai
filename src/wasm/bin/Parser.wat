(module
  (type (;0;) (func (param i32 i32 i32) (result i32)))
  (type (;1;) (func (param i32 i32)))
  (type (;2;) (func (param i32 i32 i32 i32)))
  (type (;3;) (func (param i32 i32 i32)))
  (type (;4;) (func (param i32 i32) (result f32)))
  (import "env" "memory" (memory (;0;) 16 16384))
  (func (;0;) (type 0) (param i32 i32 i32) (result i32)
    (local i32 i32 i32 i32)
    local.get 0
    local.get 2
    i32.add
    local.set 4
    local.get 1
    i32.const 255
    i32.and
    local.set 1
    local.get 2
    i32.const 67
    i32.ge_s
    if  ;; label = @1
      loop  ;; label = @2
        local.get 0
        i32.const 3
        i32.and
        if  ;; label = @3
          local.get 0
          local.get 1
          i32.store8
          local.get 0
          i32.const 1
          i32.add
          local.set 0
          br 1 (;@2;)
        end
      end
      local.get 1
      i32.const 8
      i32.shl
      local.get 1
      i32.or
      local.get 1
      i32.const 16
      i32.shl
      i32.or
      local.get 1
      i32.const 24
      i32.shl
      i32.or
      local.set 3
      local.get 4
      i32.const -4
      i32.and
      local.tee 5
      i32.const -64
      i32.add
      local.set 6
      loop  ;; label = @2
        local.get 0
        local.get 6
        i32.le_s
        if  ;; label = @3
          local.get 0
          local.get 3
          i32.store
          local.get 0
          local.get 3
          i32.store offset=4
          local.get 0
          local.get 3
          i32.store offset=8
          local.get 0
          local.get 3
          i32.store offset=12
          local.get 0
          local.get 3
          i32.store offset=16
          local.get 0
          local.get 3
          i32.store offset=20
          local.get 0
          local.get 3
          i32.store offset=24
          local.get 0
          local.get 3
          i32.store offset=28
          local.get 0
          local.get 3
          i32.store offset=32
          local.get 0
          local.get 3
          i32.store offset=36
          local.get 0
          local.get 3
          i32.store offset=40
          local.get 0
          local.get 3
          i32.store offset=44
          local.get 0
          local.get 3
          i32.store offset=48
          local.get 0
          local.get 3
          i32.store offset=52
          local.get 0
          local.get 3
          i32.store offset=56
          local.get 0
          local.get 3
          i32.store offset=60
          local.get 0
          i32.const -64
          i32.sub
          local.set 0
          br 1 (;@2;)
        end
      end
      loop  ;; label = @2
        local.get 0
        local.get 5
        i32.lt_s
        if  ;; label = @3
          local.get 0
          local.get 3
          i32.store
          local.get 0
          i32.const 4
          i32.add
          local.set 0
          br 1 (;@2;)
        end
      end
    end
    loop  ;; label = @1
      local.get 0
      local.get 4
      i32.lt_s
      if  ;; label = @2
        local.get 0
        local.get 1
        i32.store8
        local.get 0
        i32.const 1
        i32.add
        local.set 0
        br 1 (;@1;)
      end
    end
    local.get 4
    local.get 2
    i32.sub)
  (func (;1;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32)
    local.get 1
    local.get 0
    i32.load offset=28
    local.get 0
    i32.load offset=8
    local.get 0
    i32.load offset=4
    i32.mul
    i32.add
    local.tee 4
    i32.store offset=12
    local.get 1
    i32.load
    i32.eqz
    if  ;; label = @1
      return
    end
    loop  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.load offset=12
              local.get 0
              i32.load offset=20
              local.get 8
              i32.const 2
              i32.shl
              i32.add
              i32.load
              local.tee 5
              i32.const 2
              i32.shl
              i32.add
              i32.load
              br_table 0 (;@5;) 1 (;@4;) 2 (;@3;) 3 (;@2;)
            end
            local.get 1
            i32.load offset=8
            local.tee 2
            local.get 5
            i32.const 12
            i32.mul
            i32.add
            i32.load offset=4
            local.tee 3
            i32.const 255
            local.get 3
            i32.const 255
            i32.lt_u
            select
            local.set 6
            local.get 1
            i32.load offset=16
            local.set 3
            local.get 5
            i32.const 12
            i32.mul
            local.get 2
            i32.add
            i32.load
            local.set 2
            local.get 4
            local.get 6
            i32.store8
            local.get 6
            if  ;; label = @5
              local.get 2
              local.get 3
              i32.add
              local.set 2
              i32.const 0
              local.set 3
              loop  ;; label = @6
                local.get 2
                i32.const 1
                i32.add
                local.set 7
                local.get 4
                i32.const 1
                i32.add
                local.tee 4
                local.get 2
                i32.load8_s
                i32.store8
                local.get 3
                i32.const 1
                i32.add
                local.tee 3
                local.get 6
                i32.lt_u
                if  ;; label = @7
                  local.get 7
                  local.set 2
                  br 1 (;@6;)
                end
              end
            end
            br 2 (;@2;)
          end
          local.get 1
          i32.load offset=16
          local.get 1
          i32.load offset=8
          local.tee 3
          local.get 5
          i32.const 12
          i32.mul
          i32.add
          i32.load
          i32.add
          local.set 2
          local.get 5
          i32.const 12
          i32.mul
          local.get 3
          i32.add
          i32.load offset=4
          local.set 9
          block (result i32)  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 2
                  i32.load8_s
                  i32.const 43
                  i32.sub
                  br_table 1 (;@6;) 2 (;@5;) 0 (;@7;) 2 (;@5;)
                end
                i32.const 1
                local.set 6
                local.get 2
                i32.const 1
                i32.add
                local.set 2
                i32.const 1
                br 2 (;@4;)
              end
              i32.const 0
              local.set 6
              local.get 2
              i32.const 1
              i32.add
              local.set 2
              i32.const 1
              br 1 (;@4;)
            end
            i32.const 0
            local.set 6
            i32.const 0
          end
          local.tee 3
          local.get 9
          i32.lt_u
          if  ;; label = @4
            i32.const 0
            local.set 7
            loop  ;; label = @5
              local.get 2
              i32.load8_u
              local.get 7
              i32.const 10
              i32.mul
              i32.const -48
              i32.add
              i32.add
              local.set 7
              local.get 2
              i32.const 1
              i32.add
              local.set 2
              local.get 3
              i32.const 1
              i32.add
              local.tee 3
              local.get 9
              i32.ne
              br_if 0 (;@5;)
            end
          else
            i32.const 0
            local.set 7
          end
          local.get 4
          i32.const 0
          local.get 7
          i32.sub
          local.get 7
          local.get 6
          select
          i32.store
          br 1 (;@2;)
        end
        local.get 4
        local.get 1
        i32.load offset=16
        local.get 1
        i32.load offset=8
        local.tee 4
        local.get 5
        i32.const 12
        i32.mul
        i32.add
        i32.load
        i32.add
        local.get 5
        i32.const 12
        i32.mul
        local.get 4
        i32.add
        i32.load offset=4
        call 11
        f32.store
      end
      local.get 1
      local.get 0
      i32.load offset=16
      local.get 5
      i32.const 2
      i32.shl
      i32.add
      i32.load
      local.get 1
      i32.load offset=12
      i32.add
      local.tee 4
      i32.store offset=12
      local.get 8
      i32.const 1
      i32.add
      local.tee 8
      local.get 1
      i32.load
      i32.lt_u
      br_if 0 (;@1;)
    end)
  (func (;2;) (type 3) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32)
    local.get 1
    local.get 2
    i32.store
    local.get 1
    i32.const 0
    i32.store offset=4
    local.get 1
    i32.const 0
    i32.store offset=8
    local.get 2
    i32.eqz
    local.tee 6
    if  ;; label = @1
      local.get 1
      i32.const 0
      i32.store offset=8
      return
    end
    local.get 0
    i32.load offset=16
    local.set 3
    local.get 1
    i32.load offset=16
    local.set 5
    i32.const 0
    local.set 0
    loop  ;; label = @1
      local.get 0
      i32.const 2
      i32.shl
      local.get 5
      i32.add
      local.get 0
      i32.const 24
      i32.mul
      local.get 3
      i32.add
      i32.load offset=16
      local.get 0
      i32.const 24
      i32.mul
      local.get 3
      i32.add
      i32.load offset=12
      local.tee 7
      local.get 0
      i32.const 24
      i32.mul
      local.get 3
      i32.add
      i32.load offset=8
      i32.add
      i32.gt_u
      if (result i32)  ;; label = @2
        local.get 1
        i32.load offset=12
        local.get 0
        i32.const 2
        i32.shl
        i32.add
        i32.const 0
        i32.store
        local.get 0
        i32.const 24
        i32.mul
        local.get 3
        i32.add
        i32.load offset=4
        local.tee 4
        i32.const 255
        local.get 4
        i32.const 255
        i32.lt_u
        select
        i32.const 4
        i32.add
        i32.const -4
        i32.and
      else
        local.get 1
        i32.load offset=12
        local.get 0
        i32.const 2
        i32.shl
        i32.add
        local.set 4
        local.get 7
        if  ;; label = @3
          local.get 4
          i32.const 2
          i32.store
        else
          local.get 4
          i32.const 1
          i32.store
        end
        i32.const 4
      end
      local.tee 4
      i32.store
      local.get 1
      local.get 4
      local.get 1
      i32.load offset=8
      i32.add
      local.tee 4
      i32.store offset=8
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 2
      i32.ne
      br_if 0 (;@1;)
    end
    local.get 1
    local.get 4
    i32.const 3
    i32.add
    i32.const -4
    i32.and
    i32.store offset=8
    local.get 6
    if  ;; label = @1
      return
    end
    i32.const 0
    local.set 0
    loop  ;; label = @1
      local.get 0
      if  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  local.get 1
                  i32.load offset=12
                  local.tee 4
                  local.get 0
                  i32.const 2
                  i32.shl
                  i32.add
                  i32.load
                  i32.const 1
                  i32.sub
                  br_table 0 (;@7;) 1 (;@6;) 2 (;@5;)
                end
                local.get 1
                i32.load offset=20
                local.set 5
                i32.const 0
                local.set 3
                loop  ;; label = @7
                  block  ;; label = @8
                    local.get 3
                    i32.const 2
                    i32.shl
                    local.get 5
                    i32.add
                    i32.load
                    i32.const 2
                    i32.shl
                    local.get 4
                    i32.add
                    i32.load
                    br_table 4 (;@4;) 0 (;@8;) 4 (;@4;) 0 (;@8;)
                  end
                  local.get 3
                  i32.const 1
                  i32.add
                  local.tee 3
                  local.get 0
                  i32.lt_u
                  br_if 0 (;@7;)
                end
                local.get 0
                local.set 3
                br 3 (;@3;)
              end
              local.get 1
              i32.load offset=20
              local.set 5
              i32.const 0
              local.set 3
              loop  ;; label = @6
                local.get 3
                i32.const 2
                i32.shl
                local.get 5
                i32.add
                i32.load
                i32.const 2
                i32.shl
                local.get 4
                i32.add
                i32.load
                i32.eqz
                br_if 2 (;@4;)
                local.get 3
                i32.const 1
                i32.add
                local.tee 3
                local.get 0
                i32.lt_u
                br_if 0 (;@6;)
              end
              local.get 0
              local.set 3
              br 2 (;@3;)
            end
            local.get 0
            local.set 3
            br 1 (;@3;)
          end
          local.get 0
          local.set 4
          loop  ;; label = @4
            local.get 4
            i32.const 2
            i32.shl
            local.get 5
            i32.add
            local.get 4
            i32.const -1
            i32.add
            local.tee 4
            i32.const 2
            i32.shl
            local.get 5
            i32.add
            i32.load
            i32.store
            local.get 4
            local.get 3
            i32.gt_u
            br_if 0 (;@4;)
          end
        end
      else
        local.get 0
        local.set 3
      end
      local.get 1
      i32.load offset=20
      local.get 3
      i32.const 2
      i32.shl
      i32.add
      local.get 0
      i32.store
      local.get 0
      i32.const 1
      i32.add
      local.tee 0
      local.get 2
      i32.ne
      br_if 0 (;@1;)
    end
    local.get 6
    if  ;; label = @1
      return
    end
    local.get 1
    i32.load offset=24
    local.set 3
    local.get 1
    i32.load offset=20
    local.set 4
    local.get 1
    i32.load offset=16
    local.set 5
    i32.const 0
    local.set 0
    i32.const 0
    local.set 1
    loop  ;; label = @1
      local.get 1
      i32.const 2
      i32.shl
      local.get 4
      i32.add
      local.tee 6
      i32.load
      i32.const 2
      i32.shl
      local.get 3
      i32.add
      local.get 0
      i32.store
      local.get 0
      local.get 6
      i32.load
      i32.const 2
      i32.shl
      local.get 5
      i32.add
      i32.load
      i32.add
      local.set 0
      local.get 1
      i32.const 1
      i32.add
      local.tee 1
      local.get 2
      i32.ne
      br_if 0 (;@1;)
    end)
  (func (;3;) (type 3) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32 i32 i32 i32)
    local.get 1
    i32.const 52
    i32.add
    local.tee 6
    local.get 2
    i32.const 2
    i32.shl
    i32.add
    local.tee 4
    local.get 2
    i32.const 2
    i32.shl
    i32.add
    local.tee 7
    local.get 2
    i32.const 2
    i32.shl
    i32.add
    local.tee 5
    local.get 2
    i32.const 2
    i32.shl
    i32.add
    local.tee 3
    local.get 1
    i32.gt_u
    if  ;; label = @1
      local.get 1
      i32.const 0
      local.get 3
      local.get 1
      i32.sub
      call 0
      drop
    end
    local.get 1
    local.get 6
    i32.store offset=12
    local.get 1
    local.get 4
    i32.store offset=16
    local.get 1
    local.get 7
    i32.store offset=20
    local.get 1
    local.get 5
    i32.store offset=24
    local.get 1
    local.get 3
    i32.store offset=28
    local.get 0
    local.get 1
    local.get 2
    call 2
    local.get 1
    i32.const 32
    i32.add
    local.tee 8
    local.get 2
    i32.store
    local.get 1
    local.get 0
    i32.load offset=24
    local.tee 2
    i32.store offset=36
    local.get 1
    local.get 2
    i32.const 12
    i32.add
    local.tee 3
    i32.store offset=40
    local.get 1
    local.get 0
    i32.load offset=20
    i32.store offset=48
    local.get 1
    local.get 1
    i32.load offset=28
    i32.store offset=44
    local.get 0
    i32.load
    local.tee 6
    i32.eqz
    if  ;; label = @1
      return
    end
    i32.const 0
    local.set 7
    loop  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          local.get 2
          i32.load offset=8
          if  ;; label = @4
            local.get 2
            i32.load
            local.tee 5
            local.get 8
            i32.load
            i32.eq
            br_if 1 (;@3;)
          else
            local.get 8
            i32.load
            local.set 5
            br 1 (;@3;)
          end
          br 1 (;@2;)
        end
        local.get 5
        if  ;; label = @3
          local.get 1
          i32.load offset=12
          local.set 10
          i32.const 0
          local.set 4
          loop  ;; label = @4
            local.get 4
            i32.const 2
            i32.shl
            local.get 10
            i32.add
            i32.load
            local.tee 9
            if  ;; label = @5
              local.get 4
              i32.const 12
              i32.mul
              local.get 3
              i32.add
              i32.load offset=8
              local.tee 11
              i32.eqz
              br_if 3 (;@2;)
              local.get 9
              local.get 11
              i32.eq
              local.get 9
              i32.const 2
              i32.eq
              i32.or
              i32.eqz
              br_if 3 (;@2;)
            end
            local.get 4
            i32.const 1
            i32.add
            local.tee 4
            local.get 5
            i32.lt_u
            br_if 0 (;@4;)
          end
        end
        local.get 1
        local.get 8
        call 1
        local.get 1
        local.get 1
        i32.load offset=4
        i32.const 1
        i32.add
        i32.store offset=4
        local.get 1
        i32.load offset=36
        local.set 2
        local.get 1
        i32.load offset=40
        local.set 3
        local.get 0
        i32.load
        local.set 6
      end
      local.get 1
      local.get 2
      i32.load
      i32.const 12
      i32.mul
      local.get 3
      i32.add
      local.tee 2
      i32.store offset=36
      local.get 1
      local.get 2
      i32.const 12
      i32.add
      local.tee 3
      i32.store offset=40
      local.get 7
      i32.const 1
      i32.add
      local.tee 7
      local.get 6
      i32.lt_u
      br_if 0 (;@1;)
    end)
  (func (;4;) (type 3) (param i32 i32 i32)
    local.get 0
    local.get 1
    local.get 2
    call 3)
  (func (;5;) (type 2) (param i32 i32 i32 i32)
    local.get 0
    local.get 1
    local.get 2
    local.get 3
    call 10)
  (func (;6;) (type 2) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32)
    local.get 0
    i32.load offset=4
    local.tee 5
    local.get 3
    i32.gt_u
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 0
        i32.load
        local.set 6
        local.get 1
        i32.load
        local.set 7
        local.get 3
        local.set 4
        loop  ;; label = @3
          local.get 7
          local.get 4
          local.get 6
          i32.add
          i32.load8_u
          i32.ne
          if  ;; label = @4
            local.get 4
            i32.const 1
            i32.add
            local.tee 4
            local.get 5
            i32.lt_u
            if  ;; label = @5
              br 2 (;@3;)
            else
              i32.const 0
              br 3 (;@2;)
            end
            unreachable
          end
        end
        local.get 4
        i32.const 1
        local.get 3
        i32.sub
        i32.add
      end
    else
      i32.const 0
    end
    local.set 4
    local.get 3
    i32.const 0
    i32.gt_s
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        local.get 0
        i32.load
        local.set 5
        local.get 1
        i32.load
        local.set 6
        local.get 3
        local.set 0
        loop  ;; label = @3
          local.get 0
          i32.const -1
          i32.add
          local.tee 1
          local.get 5
          i32.add
          i32.load8_u
          local.get 6
          i32.ne
          if  ;; label = @4
            local.get 0
            i32.const 1
            i32.gt_s
            if  ;; label = @5
              local.get 1
              local.set 0
              br 2 (;@3;)
            else
              i32.const 0
              br 3 (;@2;)
            end
            unreachable
          end
        end
        local.get 1
        i32.const 1
        local.get 3
        i32.sub
        i32.add
      end
    else
      i32.const 0
    end
    local.tee 0
    local.get 4
    i32.or
    i32.eqz
    if  ;; label = @1
      local.get 2
      i32.const 0
      i32.store
      return
    end
    local.get 0
    local.get 4
    local.get 4
    i32.eqz
    local.tee 1
    select
    local.set 3
    local.get 0
    i32.eqz
    local.get 1
    i32.or
    if  ;; label = @1
      local.get 2
      local.get 3
      i32.store
      return
    end
    local.get 2
    local.get 4
    local.get 0
    local.get 4
    local.get 0
    i32.const 0
    local.get 0
    i32.sub
    local.get 0
    i32.const -1
    i32.gt_s
    select
    i32.lt_s
    select
    i32.store)
  (func (;7;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32 i32)
    local.get 0
    i32.load offset=20
    i32.const 2
    i32.store offset=8
    block  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load offset=24
            i32.load8_s
            local.tee 3
            i32.const 69
            i32.sub
            br_table 0 (;@4;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 1 (;@3;) 0 (;@4;) 1 (;@3;)
          end
          local.get 0
          i32.load offset=32
          local.get 3
          i32.store8
          local.get 0
          local.get 0
          i32.load offset=24
          i32.const 1
          i32.add
          local.tee 3
          i32.store offset=24
          local.get 0
          local.get 0
          i32.load offset=32
          local.tee 5
          i32.const 1
          i32.add
          local.tee 6
          i32.store offset=32
          local.get 0
          i32.const 16
          i32.add
          local.tee 2
          i32.load
          local.tee 4
          local.get 4
          i32.load offset=4
          i32.const 1
          i32.add
          i32.store offset=4
          local.get 0
          i32.load offset=20
          local.tee 4
          local.get 4
          i32.load offset=4
          i32.const 1
          i32.add
          i32.store offset=4
          block  ;; label = @4
            local.get 3
            i32.load8_s
            local.tee 4
            i32.const 43
            i32.sub
            br_table 0 (;@4;) 3 (;@1;) 0 (;@4;) 3 (;@1;)
          end
          local.get 5
          local.get 4
          i32.store8 offset=1
          local.get 0
          local.get 0
          i32.load offset=24
          i32.const 1
          i32.add
          local.tee 3
          i32.store offset=24
          local.get 0
          local.get 0
          i32.load offset=32
          i32.const 1
          i32.add
          local.tee 6
          i32.store offset=32
          br 1 (;@2;)
        end
        local.get 0
        i32.load offset=32
        local.get 3
        i32.store8
        local.get 0
        local.get 0
        i32.load offset=24
        i32.const 1
        i32.add
        local.tee 3
        i32.store offset=24
        local.get 0
        local.get 0
        i32.load offset=32
        i32.const 1
        i32.add
        local.tee 6
        i32.store offset=32
        local.get 0
        i32.const 16
        i32.add
        local.set 2
      end
      local.get 2
      i32.load
      local.tee 2
      local.get 2
      i32.load offset=4
      i32.const 1
      i32.add
      i32.store offset=4
      local.get 0
      i32.load offset=20
      local.tee 2
      local.get 2
      i32.load offset=4
      i32.const 1
      i32.add
      i32.store offset=4
    end
    local.get 3
    local.get 0
    i32.load offset=28
    local.tee 2
    i32.lt_u
    if  ;; label = @1
      block  ;; label = @2
        loop  ;; label = @3
          local.get 3
          i32.load8_s
          local.tee 4
          i32.const 255
          i32.and
          local.tee 5
          i32.const -48
          i32.add
          i32.const 10
          i32.lt_u
          if  ;; label = @4
            local.get 6
            local.get 4
            i32.store8
            local.get 0
            local.get 0
            i32.load offset=24
            i32.const 1
            i32.add
            local.tee 3
            i32.store offset=24
            local.get 0
            local.get 0
            i32.load offset=32
            i32.const 1
            i32.add
            local.tee 6
            i32.store offset=32
            local.get 0
            i32.load offset=16
            local.tee 2
            local.get 2
            i32.load offset=4
            i32.const 1
            i32.add
            i32.store offset=4
            local.get 0
            i32.load offset=20
            local.tee 2
            local.get 2
            i32.load offset=4
            i32.const 1
            i32.add
            i32.store offset=4
            local.get 3
            local.get 0
            i32.load offset=28
            local.tee 2
            i32.ge_u
            br_if 2 (;@2;)
            br 1 (;@3;)
          end
        end
        local.get 0
        i32.load offset=8
        if  ;; label = @3
          local.get 5
          local.get 1
          i32.load offset=8
          i32.eq
          local.get 3
          local.get 2
          i32.const -1
          i32.add
          i32.lt_u
          i32.and
          if  ;; label = @4
            local.get 3
            i32.load8_s offset=1
            local.get 4
            i32.ne
            br_if 2 (;@2;)
          end
        else
          local.get 5
          local.get 1
          i32.load offset=4
          i32.eq
          br_if 1 (;@2;)
          local.get 5
          local.get 1
          i32.load
          i32.ne
          local.get 4
          i32.const 13
          i32.ne
          i32.and
          i32.eqz
          if  ;; label = @4
            local.get 0
            i32.const 3
            i32.store
            return
          end
        end
        local.get 0
        i32.const 6
        i32.store
        return
      end
    end
    local.get 0
    i32.const 3
    i32.store)
  (func (;8;) (type 1) (param i32 i32)
    (local i32 i32 i32 i32)
    local.get 0
    i32.load offset=20
    i32.const 1
    i32.store offset=8
    block  ;; label = @1
      block  ;; label = @2
        local.get 0
        i32.load offset=24
        local.tee 3
        i32.load8_s
        local.tee 2
        i32.const 43
        i32.sub
        br_table 0 (;@2;) 1 (;@1;) 0 (;@2;) 1 (;@1;)
      end
      local.get 0
      i32.load offset=32
      local.get 2
      i32.store8
      local.get 0
      local.get 0
      i32.load offset=24
      i32.const 1
      i32.add
      local.tee 3
      i32.store offset=24
      local.get 0
      local.get 0
      i32.load offset=32
      i32.const 1
      i32.add
      i32.store offset=32
      local.get 0
      i32.load offset=16
      local.tee 2
      local.get 2
      i32.load offset=4
      i32.const 1
      i32.add
      i32.store offset=4
      local.get 0
      i32.load offset=20
      local.tee 2
      local.get 2
      i32.load offset=4
      i32.const 1
      i32.add
      i32.store offset=4
    end
    block  ;; label = @1
      local.get 3
      local.get 0
      i32.load offset=28
      local.tee 2
      i32.ge_u
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 3
        i32.load8_s
        local.tee 4
        i32.const 255
        i32.and
        local.tee 5
        i32.const -48
        i32.add
        i32.const 10
        i32.lt_u
        if  ;; label = @3
          local.get 0
          i32.load offset=32
          local.get 4
          i32.store8
          local.get 0
          local.get 0
          i32.load offset=24
          i32.const 1
          i32.add
          local.tee 3
          i32.store offset=24
          local.get 0
          local.get 0
          i32.load offset=32
          i32.const 1
          i32.add
          i32.store offset=32
          local.get 0
          i32.load offset=16
          local.tee 2
          local.get 2
          i32.load offset=4
          i32.const 1
          i32.add
          i32.store offset=4
          local.get 0
          i32.load offset=20
          local.tee 2
          local.get 2
          i32.load offset=4
          i32.const 1
          i32.add
          i32.store offset=4
          local.get 3
          local.get 0
          i32.load offset=28
          local.tee 2
          i32.ge_u
          br_if 2 (;@1;)
          br 1 (;@2;)
        end
      end
      local.get 0
      i32.load offset=8
      if  ;; label = @2
        local.get 5
        local.get 1
        i32.load offset=8
        i32.eq
        local.get 3
        local.get 2
        i32.const -1
        i32.add
        i32.lt_u
        i32.and
        if  ;; label = @3
          local.get 3
          i32.load8_s offset=1
          local.get 4
          i32.ne
          br_if 2 (;@1;)
        end
      else
        local.get 5
        local.get 1
        i32.load offset=4
        i32.eq
        br_if 1 (;@1;)
        local.get 5
        local.get 1
        i32.load
        i32.ne
        local.get 4
        i32.const 13
        i32.ne
        i32.and
        i32.eqz
        br_if 1 (;@1;)
      end
      block  ;; label = @2
        block  ;; label = @3
          local.get 4
          i32.const 46
          i32.sub
          br_table 0 (;@3;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 0 (;@3;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 1 (;@2;) 0 (;@3;) 1 (;@2;)
        end
        local.get 0
        i32.const 5
        i32.store
        return
      end
      local.get 0
      i32.const 6
      i32.store
      return
    end
    local.get 0
    i32.const 3
    i32.store)
  (func (;9;) (type 3) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32)
    local.get 0
    i32.load offset=24
    local.set 3
    local.get 0
    i32.load offset=8
    if  ;; label = @1
      local.get 3
      i32.load8_u
      local.get 1
      i32.load offset=8
      i32.eq
      if  ;; label = @2
        local.get 0
        i32.const 0
        i32.store offset=8
        local.get 0
        local.get 3
        i32.const 1
        i32.add
        local.tee 3
        i32.store offset=24
      else
        local.get 0
        i32.load offset=16
        local.tee 4
        local.get 4
        i32.load offset=8
        i32.const 1
        i32.or
        i32.store offset=8
      end
    end
    local.get 3
    i32.load8_s
    i32.const 13
    i32.eq
    if  ;; label = @1
      local.get 0
      local.get 3
      i32.const 1
      i32.add
      local.tee 3
      i32.store offset=24
    end
    local.get 3
    local.get 0
    i32.load offset=28
    local.tee 4
    i32.lt_u
    if  ;; label = @1
      local.get 3
      i32.load8_u
      local.tee 5
      local.get 1
      i32.load offset=4
      local.tee 7
      i32.ne
      if  ;; label = @2
        local.get 5
        local.get 1
        i32.load
        local.tee 5
        i32.ne
        if  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load offset=16
            local.tee 6
            local.get 6
            i32.load offset=8
            i32.const 4
            i32.or
            i32.store offset=8
            loop  ;; label = @5
              local.get 7
              local.get 3
              i32.load8_u
              local.tee 6
              i32.eq
              local.get 5
              local.get 6
              i32.eq
              i32.or
              br_if 1 (;@4;)
              local.get 0
              local.get 3
              i32.const 1
              i32.add
              local.tee 3
              i32.store offset=24
              local.get 3
              local.get 4
              i32.lt_u
              br_if 0 (;@5;)
            end
          end
        end
      end
    end
    block  ;; label = @1
      block  ;; label = @2
        local.get 3
        local.get 4
        i32.ge_u
        br_if 0 (;@2;)
        local.get 3
        i32.load8_u
        local.tee 4
        local.get 1
        i32.load
        i32.eq
        br_if 0 (;@2;)
        local.get 4
        local.get 1
        i32.load offset=4
        i32.eq
        if  ;; label = @3
          local.get 0
          i32.const 2
          i32.store
          local.get 0
          local.get 3
          i32.const 1
          i32.add
          i32.store offset=24
        end
        br 1 (;@1;)
      end
      local.get 0
      i32.const 1
      i32.store
    end
    local.get 2
    i32.load offset=16
    local.tee 2
    local.get 0
    i32.load offset=16
    local.tee 7
    i32.load
    local.tee 1
    i32.const 24
    i32.mul
    i32.add
    local.tee 3
    i32.load offset=4
    local.set 4
    local.get 3
    local.get 4
    local.get 0
    i32.load offset=20
    local.tee 5
    i32.load offset=4
    local.tee 3
    local.get 4
    local.get 3
    i32.gt_u
    select
    i32.store offset=4
    local.get 1
    i32.const 24
    i32.mul
    local.get 2
    i32.add
    local.tee 6
    i32.load
    local.set 4
    local.get 6
    local.get 4
    local.get 3
    local.get 4
    local.get 3
    i32.lt_u
    select
    i32.store
    local.get 3
    if (result i32)  ;; label = @1
      block (result i32)  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 5
              i32.load offset=8
              i32.const 1
              i32.sub
              br_table 0 (;@5;) 1 (;@4;) 2 (;@3;)
            end
            local.get 1
            i32.const 24
            i32.mul
            local.get 2
            i32.add
            i32.const 8
            i32.add
            br 2 (;@2;)
          end
          local.get 1
          i32.const 24
          i32.mul
          local.get 2
          i32.add
          i32.const 12
          i32.add
          br 1 (;@2;)
        end
        local.get 1
        i32.const 24
        i32.mul
        local.get 2
        i32.add
        i32.const 16
        i32.add
      end
    else
      local.get 1
      i32.const 24
      i32.mul
      local.get 2
      i32.add
      i32.const 20
      i32.add
    end
    local.tee 2
    local.get 2
    i32.load
    i32.const 1
    i32.add
    i32.store
    local.get 0
    local.get 5
    i32.const 12
    i32.add
    i32.store offset=20
    local.get 7
    local.get 1
    i32.const 1
    i32.add
    i32.store)
  (func (;10;) (type 2) (param i32 i32 i32 i32)
    (local i32 i32 i32 i32 i32)
    local.get 2
    i32.const -64
    i32.sub
    local.tee 5
    local.get 3
    i32.const 24
    i32.mul
    i32.add
    local.tee 4
    local.set 6
    local.get 4
    local.get 2
    i32.gt_u
    if  ;; label = @1
      local.get 2
      i32.const 0
      local.get 6
      local.get 2
      i32.sub
      call 0
      drop
    end
    local.get 2
    i32.const 0
    i32.store offset=8
    local.get 2
    i32.const 0
    i32.store offset=12
    local.get 2
    local.get 5
    i32.store offset=16
    local.get 2
    local.get 4
    i32.store offset=20
    local.get 2
    local.get 0
    i32.load offset=4
    local.tee 8
    local.get 4
    i32.add
    local.tee 7
    i32.store offset=24
    local.get 3
    if  ;; label = @1
      i32.const 0
      local.set 4
      loop  ;; label = @2
        local.get 4
        i32.const 24
        i32.mul
        local.get 5
        i32.add
        i32.const -1
        i32.store
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 3
        i32.ne
        br_if 0 (;@2;)
      end
    end
    local.get 2
    i32.const 28
    i32.add
    local.tee 5
    i32.const 0
    i32.store
    local.get 2
    local.get 3
    i32.store offset=32
    local.get 2
    i32.const 1
    i32.store offset=40
    local.get 2
    local.get 7
    i32.store offset=44
    local.get 2
    local.get 7
    i32.const 12
    i32.add
    i32.store offset=48
    local.get 2
    local.get 0
    i32.load
    local.tee 0
    i32.store offset=52
    local.get 2
    local.get 0
    local.get 8
    i32.add
    i32.store offset=56
    local.get 2
    local.get 6
    i32.store offset=60
    i32.const 0
    local.set 0
    block  ;; label = @1
      block  ;; label = @2
        loop  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              block  ;; label = @6
                block  ;; label = @7
                  block  ;; label = @8
                    block  ;; label = @9
                      block  ;; label = @10
                        block  ;; label = @11
                          block  ;; label = @12
                            local.get 0
                            br_table 2 (;@10;) 3 (;@9;) 0 (;@12;) 1 (;@11;) 4 (;@8;) 5 (;@7;) 6 (;@6;) 7 (;@5;)
                          end
                          local.get 2
                          i32.load offset=48
                          local.tee 0
                          i32.const 0
                          i32.store offset=4
                          local.get 0
                          local.get 2
                          i32.load offset=60
                          local.get 2
                          i32.load offset=20
                          i32.sub
                          i32.store
                          local.get 0
                          i32.const 0
                          i32.store offset=8
                          local.get 2
                          i32.load offset=52
                          local.tee 0
                          i32.load8_u
                          local.get 1
                          i32.load offset=8
                          i32.eq
                          if  ;; label = @12
                            local.get 2
                            i32.const 1
                            i32.store offset=36
                            local.get 2
                            local.get 0
                            i32.const 1
                            i32.add
                            local.tee 0
                            i32.store offset=52
                          else
                            local.get 2
                            i32.const 0
                            i32.store offset=36
                          end
                          local.get 0
                          i32.load8_s
                          local.tee 0
                          i32.const 255
                          i32.and
                          i32.const -48
                          i32.add
                          i32.const 10
                          i32.ge_u
                          if  ;; label = @12
                            block  ;; label = @13
                              block  ;; label = @14
                                local.get 0
                                i32.const 43
                                i32.sub
                                br_table 1 (;@13;) 0 (;@14;) 1 (;@13;) 0 (;@14;)
                              end
                              local.get 5
                              i32.const 6
                              i32.store
                              br 8 (;@5;)
                            end
                          end
                          local.get 5
                          i32.const 4
                          i32.store
                          br 6 (;@5;)
                        end
                        local.get 5
                        local.get 1
                        local.get 2
                        call 9
                        br 5 (;@5;)
                      end
                      local.get 2
                      i32.load offset=52
                      local.tee 0
                      local.get 2
                      i32.load offset=56
                      local.tee 3
                      i32.ge_u
                      br_if 5 (;@4;)
                      local.get 1
                      i32.load
                      local.set 4
                      loop  ;; label = @10
                        local.get 4
                        local.get 0
                        i32.load8_u
                        i32.eq
                        if  ;; label = @11
                          local.get 2
                          local.get 0
                          i32.const 1
                          i32.add
                          local.tee 0
                          i32.store offset=52
                          local.get 0
                          local.get 3
                          i32.ge_u
                          br_if 7 (;@4;)
                          br 1 (;@10;)
                        end
                      end
                      local.get 2
                      local.get 2
                      i32.load
                      i32.const 1
                      i32.add
                      i32.store
                      local.get 2
                      i32.load offset=44
                      local.tee 0
                      i32.const 0
                      i32.store
                      local.get 0
                      i32.const 0
                      i32.store offset=4
                      local.get 0
                      i32.const 0
                      i32.store offset=8
                      local.get 5
                      i32.const 2
                      i32.store
                      br 4 (;@5;)
                    end
                    local.get 2
                    i32.load offset=52
                    local.tee 0
                    local.get 2
                    i32.load offset=56
                    i32.lt_u
                    if  ;; label = @9
                      local.get 2
                      local.get 0
                      i32.const 1
                      i32.add
                      i32.store offset=52
                    else
                      local.get 2
                      i32.const 0
                      i32.store offset=40
                    end
                    local.get 2
                    i32.load offset=44
                    local.tee 0
                    i32.load offset=8
                    local.set 3
                    block  ;; label = @9
                      block  ;; label = @10
                        local.get 0
                        i32.load
                        local.get 2
                        i32.load offset=32
                        i32.eq
                        if  ;; label = @11
                          local.get 3
                          br_if 1 (;@10;)
                        else
                          local.get 0
                          local.get 3
                          i32.const 2
                          i32.or
                          i32.store offset=8
                          br 1 (;@10;)
                        end
                        br 1 (;@9;)
                      end
                      local.get 2
                      local.get 2
                      i32.load offset=4
                      i32.const 1
                      i32.add
                      i32.store offset=4
                    end
                    local.get 2
                    local.get 2
                    i32.load offset=48
                    local.tee 0
                    i32.store offset=44
                    local.get 2
                    local.get 0
                    i32.const 12
                    i32.add
                    i32.store offset=48
                    local.get 5
                    i32.const 0
                    i32.store
                    br 3 (;@5;)
                  end
                  local.get 5
                  local.get 1
                  call 8
                  br 2 (;@5;)
                end
                local.get 5
                local.get 1
                call 7
                br 1 (;@5;)
              end
              local.get 2
              i32.load offset=48
              i32.const 0
              i32.store offset=8
              local.get 2
              i32.load offset=52
              local.tee 0
              local.get 2
              i32.load offset=56
              local.tee 3
              i32.lt_u
              if  ;; label = @6
                loop  ;; label = @7
                  block  ;; label = @8
                    local.get 0
                    i32.load8_s
                    local.tee 4
                    i32.const 255
                    i32.and
                    local.set 6
                    local.get 2
                    i32.load offset=36
                    if  ;; label = @9
                      local.get 6
                      local.get 1
                      i32.load offset=8
                      i32.eq
                      local.tee 6
                      local.get 0
                      local.get 3
                      i32.const -1
                      i32.add
                      i32.lt_u
                      i32.and
                      if  ;; label = @10
                        local.get 0
                        i32.load8_s offset=1
                        local.get 4
                        i32.ne
                        br_if 2 (;@8;)
                      end
                      local.get 6
                      if  ;; label = @10
                        local.get 2
                        local.get 0
                        i32.const 1
                        i32.add
                        i32.store offset=52
                        local.get 0
                        i32.load8_s offset=1
                        local.set 4
                      end
                    else
                      local.get 6
                      local.get 1
                      i32.load offset=4
                      i32.eq
                      br_if 1 (;@8;)
                      local.get 1
                      i32.load
                      local.get 6
                      i32.ne
                      local.get 4
                      i32.const 13
                      i32.ne
                      i32.and
                      i32.eqz
                      br_if 1 (;@8;)
                    end
                    local.get 2
                    i32.load offset=60
                    local.get 4
                    i32.store8
                    local.get 2
                    local.get 2
                    i32.load offset=52
                    i32.const 1
                    i32.add
                    local.tee 0
                    i32.store offset=52
                    local.get 2
                    local.get 2
                    i32.load offset=60
                    i32.const 1
                    i32.add
                    i32.store offset=60
                    local.get 2
                    i32.load offset=44
                    local.tee 3
                    local.get 3
                    i32.load offset=4
                    i32.const 1
                    i32.add
                    i32.store offset=4
                    local.get 2
                    i32.load offset=48
                    local.tee 3
                    local.get 3
                    i32.load offset=4
                    i32.const 1
                    i32.add
                    i32.store offset=4
                    local.get 0
                    local.get 2
                    i32.load offset=56
                    local.tee 3
                    i32.lt_u
                    br_if 1 (;@7;)
                  end
                end
              end
              local.get 5
              i32.const 3
              i32.store
            end
            local.get 2
            i32.load offset=40
            i32.eqz
            br_if 2 (;@2;)
            local.get 5
            i32.load
            local.set 0
            br 1 (;@3;)
          end
        end
        br 1 (;@1;)
      end
      local.get 2
      i32.load offset=48
      local.set 0
      local.get 2
      i32.load offset=24
      local.set 1
      local.get 2
      local.get 2
      i32.load offset=60
      local.get 2
      i32.load offset=20
      i32.sub
      i32.store offset=8
      local.get 2
      local.get 0
      local.get 1
      i32.sub
      i32.store offset=12
      return
    end
    local.get 2
    i32.const 0
    i32.store offset=40
    local.get 2
    i32.load offset=48
    local.set 0
    local.get 2
    i32.load offset=24
    local.set 1
    local.get 2
    local.get 2
    i32.load offset=60
    local.get 2
    i32.load offset=20
    i32.sub
    i32.store offset=8
    local.get 2
    local.get 0
    local.get 1
    i32.sub
    i32.store offset=12)
  (func (;11;) (type 4) (param i32 i32) (result f32)
    (local i32 i32 i32 i32 f32 f32)
    block (result i32)  ;; label = @1
      block  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            local.get 0
            i32.load8_s
            i32.const 43
            i32.sub
            br_table 1 (;@3;) 2 (;@2;) 0 (;@4;) 2 (;@2;)
          end
          i32.const 1
          local.set 4
          local.get 0
          i32.const 1
          i32.add
          local.set 0
          i32.const 1
          br 2 (;@1;)
        end
        local.get 0
        i32.const 1
        i32.add
        local.set 0
        i32.const 1
        br 1 (;@1;)
      end
      i32.const 0
    end
    local.tee 2
    local.get 1
    i32.lt_u
    if  ;; label = @1
      block  ;; label = @2
        loop  ;; label = @3
          local.get 0
          i32.load8_s
          local.tee 3
          i32.const -48
          i32.add
          i32.const 24
          i32.shl
          i32.const 24
          i32.shr_s
          i32.const 255
          i32.and
          i32.const 10
          i32.lt_s
          if  ;; label = @4
            local.get 6
            f32.const 0x1.4p+3 (;=10;)
            f32.mul
            local.get 3
            i32.const 255
            i32.and
            i32.const -48
            i32.add
            f32.convert_i32_s
            f32.add
            local.set 6
            local.get 0
            i32.const 1
            i32.add
            local.set 0
            local.get 2
            i32.const 1
            i32.add
            local.tee 2
            local.get 1
            i32.lt_u
            br_if 1 (;@3;)
            br 2 (;@2;)
          end
        end
        block  ;; label = @3
          local.get 3
          i32.const 44
          i32.sub
          br_table 0 (;@3;) 1 (;@2;) 0 (;@3;) 1 (;@2;)
        end
        local.get 0
        i32.const 1
        i32.add
        local.set 0
        local.get 2
        i32.const 1
        i32.add
        local.tee 2
        local.get 1
        i32.lt_u
        if  ;; label = @3
          f32.const 0x1p+0 (;=1;)
          local.set 7
          loop  ;; label = @4
            local.get 0
            i32.load8_s
            local.tee 3
            i32.const -48
            i32.add
            i32.const 24
            i32.shl
            i32.const 24
            i32.shr_s
            i32.const 255
            i32.and
            i32.const 10
            i32.ge_s
            br_if 2 (;@2;)
            local.get 6
            local.get 7
            f32.const 0x1.4p+3 (;=10;)
            f32.div
            local.tee 7
            local.get 3
            i32.const 255
            i32.and
            i32.const -48
            i32.add
            f32.convert_i32_s
            f32.mul
            f32.add
            local.set 6
            local.get 0
            i32.const 1
            i32.add
            local.set 0
            local.get 2
            i32.const 1
            i32.add
            local.tee 2
            local.get 1
            i32.lt_u
            br_if 0 (;@4;)
          end
        end
      end
    end
    block  ;; label = @1
      local.get 2
      local.get 1
      i32.ge_u
      br_if 0 (;@1;)
      block  ;; label = @2
        local.get 0
        i32.load8_s
        i32.const 69
        i32.sub
        br_table 0 (;@2;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 1 (;@1;) 0 (;@2;) 1 (;@1;)
      end
      local.get 1
      i32.const -1
      i32.add
      local.get 2
      i32.sub
      local.set 5
      block (result i32)  ;; label = @2
        block  ;; label = @3
          block  ;; label = @4
            block  ;; label = @5
              local.get 0
              i32.const 1
              i32.add
              local.tee 2
              i32.load8_s
              i32.const 43
              i32.sub
              br_table 1 (;@4;) 2 (;@3;) 0 (;@5;) 2 (;@3;)
            end
            i32.const 1
            local.set 1
            i32.const 1
            local.set 3
            local.get 0
            i32.const 2
            i32.add
            br 2 (;@2;)
          end
          i32.const 1
          local.set 1
          i32.const 0
          local.set 3
          local.get 0
          i32.const 2
          i32.add
          br 1 (;@2;)
        end
        i32.const 0
        local.set 1
        i32.const 0
        local.set 3
        local.get 2
      end
      local.set 0
      local.get 1
      local.get 5
      i32.lt_u
      if  ;; label = @2
        i32.const 0
        local.set 2
        loop  ;; label = @3
          local.get 0
          i32.load8_u
          local.get 2
          i32.const 10
          i32.mul
          i32.const -48
          i32.add
          i32.add
          local.set 2
          local.get 0
          i32.const 1
          i32.add
          local.set 0
          local.get 1
          i32.const 1
          i32.add
          local.tee 1
          local.get 5
          i32.ne
          br_if 0 (;@3;)
        end
      else
        i32.const 0
        local.set 2
      end
      i32.const 0
      local.get 2
      i32.sub
      local.get 2
      local.get 3
      select
      local.tee 0
      i32.eqz
      br_if 0 (;@1;)
      i32.const 0
      local.get 0
      i32.sub
      local.get 0
      local.get 0
      i32.const 0
      i32.lt_s
      local.tee 1
      select
      local.set 0
      f32.const 0x1.99999ap-4 (;=0.1;)
      f32.const 0x1.4p+3 (;=10;)
      local.get 1
      select
      local.set 7
      local.get 0
      i32.const 1
      i32.ne
      if  ;; label = @2
        loop  ;; label = @3
          local.get 6
          local.get 6
          local.get 7
          f32.mul
          local.get 0
          i32.const 1
          i32.and
          i32.eqz
          local.tee 1
          select
          local.set 6
          local.get 7
          local.get 7
          f32.mul
          local.get 7
          local.get 1
          select
          local.set 7
          local.get 0
          i32.const 1
          i32.shr_s
          local.get 0
          i32.const -1
          i32.add
          local.get 1
          select
          local.tee 0
          i32.const 1
          i32.ne
          br_if 0 (;@3;)
        end
      end
      local.get 6
      local.get 7
      f32.mul
      local.tee 6
      f32.neg
      local.get 6
      local.get 4
      select
      return
    end
    local.get 6
    f32.neg
    local.get 6
    local.get 4
    select)
  (export "_convertToBinary" (func 4))
  (export "_findRowEnd" (func 6))
  (export "_parseBuffer" (func 5)))
